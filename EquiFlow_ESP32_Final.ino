#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h> 
#include <ESPmDNS.h> 

// --- NEW HOTSPOT CREDENTIALS ---
const char* ssid = "namdev(sairajnet)";
const char* password = "Laxman@1948"; 

const int FLOW_IN = 14; 
const int FLOW_OUT = 27;
const int TDS_PIN = 34;
const int RELAY_PIN = 18;
const int SERVO_PIN = 13;

Servo smartValve;

// --- CALIBRATED LEAK THRESHOLD ---
// Normal is ~24-25 L/min. Leak is >30 L/min. 
// We set the trip-wire at 27.5 to prevent false alarms!
const float LEAK_THRESHOLD = 27.5; 

unsigned long leakStart = 0;
bool isLeaking = false;
bool motorOn = false;
int valveAngle = 0;

volatile int pIn = 0; volatile int pOut = 0;
void IRAM_ATTR cIn() { pIn++; }
void IRAM_ATTR cOut() { pOut++; }

WebServer server(80);

void handleData() {
  float fIn = pIn / 7.5; 
  float fOut = pOut / 7.5; // Removed multiplier since you have raw readings now
  
  pIn = 0; pOut = 0;
  
  float diff = fIn - fOut;
  if (diff < 0) diff = 0; // Prevent negative variance on dashboard
  
  float tds = (analogRead(TDS_PIN) / 4095.0) * 1000.0;

  // --- SMART LEAK DETECTION WITH NEW THRESHOLD ---
  if (fIn > 0.5 && diff > LEAK_THRESHOLD) {
    if (!isLeaking) { isLeaking = true; leakStart = millis(); }
  } else { isLeaking = false; leakStart = 0; }

  // --- 10s AUTO-TRIP ---
  if (isLeaking && motorOn && (millis() - leakStart > 10000)) {
    motorOn = false;
    digitalWrite(RELAY_PIN, HIGH); // OFF
    smartValve.write(0);
    valveAngle = 0;
  }

  StaticJsonDocument<500> doc;
  doc["flow1"] = fIn;
  doc["flow2"] = fOut;
  doc["flowDiff"] = diff;
  doc["tds"] = tds;
  doc["motor"] = motorOn ? "ON" : "OFF";
  doc["status"] = isLeaking ? "LEAK_DETECTED" : "NOMINAL";
  doc["timer"] = (isLeaking && motorOn) ? (10 - (millis() - leakStart)/1000) : 10;
  doc["valvePos"] = valveAngle;

  String js; serializeJson(doc, js);
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", js);
}

// --- OBJECTIVE 1: START ---
void handleStart() {
  motorOn = true;
  digitalWrite(RELAY_PIN, LOW); // ON
  smartValve.write(90);
  valveAngle = 90;
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", "OK");
}

// --- OBJECTIVE 1: STOP ---
void handleStop() {
  motorOn = false;
  digitalWrite(RELAY_PIN, HIGH); // OFF
  smartValve.write(0);
  valveAngle = 0;
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", "OK");
}

// --- OBJECTIVE 3: ALTITUDE BALANCING ---
void handleBalance() {
  if(motorOn) {
    smartValve.write(45); // Throttles the valve to 50%
    valveAngle = 45;
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain", "Balancing Mode Active");
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT); digitalWrite(RELAY_PIN, HIGH);
  smartValve.attach(SERVO_PIN);
  smartValve.write(0); 

  pinMode(FLOW_IN, INPUT_PULLUP); pinMode(FLOW_OUT, INPUT_PULLUP);
  attachInterrupt(FLOW_IN, cIn, RISING); attachInterrupt(FLOW_OUT, cOut, RISING);

  // --- WIRELESS CONNECTION ---
  Serial.print("Connecting to Hotspot...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // --- MDNS SETUP ---
  if (!MDNS.begin("equiflow")) {
    Serial.println("Error setting up MDNS responder!");
  } else {
    Serial.println("mDNS responder started: http://equiflow.local");
  }

  server.on("/data", handleData);
  server.on("/motor/on", handleStart);
  server.on("/motor/off", handleStop);
  server.on("/balance", handleBalance); // Added balance endpoint
  server.begin();
}

void loop() { 
  server.handleClient();
} THIS IS THE ACTUAL CODE I HAD USED 