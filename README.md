 5G Infrastructure Monitor — India Hub 




 
 🚀 Live Demo [https://fiveg-monitering-system-3.onrender.com/]
 The 5G Infrastructure Monitor is a professional-grade telemetry dashboard developed 
 to simulate and visualize the health of 5G network infrastructure across India.
 It provides a centralized platform for network engineers to monitor base station 
 performance across 28 States and 8 Union Territories in real-time.This repository
 contains the full-stack application, including the Python (Flask) Backend API and 
 the Glass-morphism Frontend.✨ Key FeaturesUser ExperienceDynamic Telemetry 
 Dashboard: Visualizes live data for 36 major hubs with instant status indicators 
 (Active, Degraded, Offline).Advanced Filtering: Sort base stations by geographic 
 category (States vs. Union Territories) or operational status.
 Cyber-Tech UI: A modern, high-contrast Dark Mode interface featuring 
 glass-morphism effects and responsive CSS Grid layouts.
 Search Functionality: Quickly locate specific hubs by searching for State names,
 Cities, or specific Network Operators (Jio, Airtel, Vi).
 Technical & BackendReal-time Simulation Engine: A robust Python backend that 
 generates realistic network metrics (Throughput, Latency, RSRP, and Packet Loss)
 using mathematical noise functions.Flask REST API: High-performance endpoints for 
 retrieving global metrics or specific tower details.Production Ready: Configured 
 with Gunicorn for stable deployment on cloud environments like Render.
 CORS Enabled: Fully configured to allow secure cross-origin communication between 
 the dashboard and API.🛠️ Technology StackComponentTechnologyDescriptionBackendPython
 3Core logic for network simulation and data handling.FrameworkFlaskLightweight WSGI
 web framework for API routing.Web ServerGunicornProduction-grade WSGI HTTP Server.
 FrontendHTML5, CSS3, JS (ES6)Custom-built dashboard with vanilla JavaScript state 
 management.DesignGlass-morphismModern UI style with backdrop filters 
 and neon accents.
 🚀 Installation and Setup
 This is a single-repository project where the Flask Backend serves the Frontend assets.
 Pre requisites
 Python 3.8+ installed.
 pip (Python package manager).
 Step-by-Step Guide
 Clone the Repository:Bashgit clone https://github.com/YOUR_USERNAME/5G-Monitor-India.git
cd 5G-Monitor-India
Install Dependencies:Bashpip install -r requirements.txt
Run the Application:Start the Flask server locally.
By default, it runs on port 5001.Bashpython3 backend.py
Access the System:Open your browser and navigate to: http://localhost:5001
⚙️ API EndpointsThe API follows REST principles and provides real-time JSON data.
MethodEndpointDescriptionGET/Serves the primary Frontend dashboard (index.html).
GET/api/metricsRetrieves a live snapshot of all 36 towers and their current metrics.
GET/api/tower/{id}Fetches detailed, high-resolution telemetry for a single tower.
🧑‍💻 Contributing and DebuggingDeployment: This project is pre-configured for Render.
Ensure your Start Command is set to gunicorn backend:app.
Simulation Logic: The telemetry is generated in backend.py using simulate_metrics(). 
You can adjust the BAND_MULT constants to change the performance levels of different
5G bands (n78, n41, mmWave).
📞 ContactProject Maintained by:Name:
[suhail sayar]Roll Number: [230339]Email: [suhailsahil508@gmail.com]
Developed as part of a 5G Network Systems research project at GCET.
