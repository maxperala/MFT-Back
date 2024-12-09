import http.server
import socketserver
import os
PORT = 8000

dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(dir)

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:

    print(f"CDN Running at port {PORT}")
    print(os.getcwd())
    httpd.serve_forever()