#!/usr/bin/env python3
"""
MOCK Semantic Web Mining Engine
For testing frontend/backend integration without actual web scraping
"""

import json
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
import sys
from datetime import datetime

class MockSemanticHandler(BaseHTTPRequestHandler):
    
    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
        self.send_header('Content-Type', 'application/json')
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def send_json_response(self, data, status_code=200):
        try:
            self.send_response(status_code)
            self.send_cors_headers()
            self.end_headers()
            response_json = json.dumps(data, indent=2)
            self.wfile.write(response_json.encode('utf-8'))
            self.wfile.flush()
        except (ConnectionAbortedError, BrokenPipeError, OSError) as e:
            print(f"[INFO] Client disconnected: {type(e).__name__}")
            pass
    
    def generate_mock_articles(self, search_term, count=5):
        """Generate mock articles for testing"""
        articles = []
        for i in range(count):
            articles.append({
                "id": f"mock_{i+1}",
                "title": f"{search_term.title()} Article {i+1}",
                "description": f"This is a mock article about {search_term}. It contains relevant information for testing the frontend display and functionality.",
                "url": f"https://example.com/article-{i+1}",
                "published_date": f"2024-10-{16-i:02d}T12:00:00Z",
                "source": f"MockSource{i+1}",
                "wordcloud_words": f"{search_term} technology innovation development learning tutorial guide example implementation",
                "wordcloud_scores": "0.9 0.8 0.7 0.6 0.5 0.4 0.3 0.2 0.1"
            })
        return articles
    
    def do_GET(self):
        try:
            parsed_path = urllib.parse.urlparse(self.path)
            path_parts = [p for p in parsed_path.path.strip('/').split('/') if p]
            
            print(f"🔍 Mock Request: {self.path}")
            
            # Health check endpoint
            if self.path == '/health':
                response = {
                    "message": "Mock Semantic Web Mining Engine Online",
                    "status": "healthy",
                    "timestamp": datetime.now().isoformat(),
                    "mode": "MOCK_TESTING",
                    "endpoints": {
                        "search": "/articles/search/{search}/{first}/{last}/{order}",
                        "count": "/articles/results/{search}",
                        "health": "/health"
                    }
                }
                self.send_json_response(response)
                return
            
            # Articles search endpoint
            if (len(path_parts) >= 5 and 
                path_parts[0] == 'articles' and 
                path_parts[1] == 'search'):
                
                search = urllib.parse.unquote(path_parts[2])
                first = int(path_parts[3])
                last = int(path_parts[4])
                order_by = path_parts[5] if len(path_parts) > 5 else 'asc'
                
                print(f"🧠 Mock search: '{search}' [{first}:{last}] order={order_by}")
                
                # Generate mock articles
                all_articles = self.generate_mock_articles(search, 20)
                
                # Sort articles
                if order_by.lower() == 'desc':
                    all_articles.sort(key=lambda x: x['published_date'], reverse=True)
                else:
                    all_articles.sort(key=lambda x: x['published_date'])
                
                # Apply pagination
                paginated_articles = all_articles[first:last]
                
                response = {
                    "articles": paginated_articles,
                    "total_found": len(all_articles),
                    "returned_count": len(paginated_articles),
                    "search_term": search,
                    "pagination": {
                        "first": first,
                        "last": last,
                        "total": len(all_articles)
                    },
                    "mock_mode": True
                }
                
                self.send_json_response(response)
                return
            
            # Articles count endpoint
            if (len(path_parts) >= 3 and 
                path_parts[0] == 'articles' and 
                path_parts[1] == 'results'):
                
                search = urllib.parse.unquote(path_parts[2])
                print(f"🔢 Mock count for: '{search}'")
                
                response = {
                    "search_term": search,
                    "total_articles": 20,  # Mock count
                    "mock_mode": True
                }
                
                self.send_json_response(response)
                return
            
            # 404 for unknown endpoints
            response = {
                "message": "Endpoint not found",
                "status": "error",
                "available_endpoints": [
                    "/articles/search/{search}/{first}/{last}/{order}",
                    "/articles/results/{search}",
                    "/health"
                ]
            }
            self.send_json_response(response, 404)
                
        except Exception as e:
            print(f"❌ Mock API error: {e}")
            try:
                response = {
                    "message": f"Mock processing error: {str(e)}",
                    "status": "error",
                    "mock_mode": True
                }
                self.send_json_response(response, 500)
            except:
                pass

def run_mock_server():
    """Start the mock semantic web mining server"""
    print("🧪 MOCK SEMANTIC WEB MINING ENGINE")
    print("=" * 50)
    print("🎯 Purpose: Test frontend/backend integration")
    print("📊 Returns: Mock data for development")
    print()
    print("✅ Mock Engine Ready!")
    print("🌐 Starting server on http://localhost:8080")
    print()
    print("📡 Mock API Endpoints:")
    print("   🧠 Mock Search: GET /articles/search/{search}/{first}/{last}/{order}")
    print("   🔢 Mock Count: GET /articles/results/{search}")
    print("   💚 Health Check: GET /health")
    print()
    print("⏹️  Press Ctrl+C to stop the mock engine")
    print("=" * 50)
    
    try:
        server = HTTPServer(('localhost', 8080), MockSemanticHandler)
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Mock semantic engine stopped")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Mock server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_mock_server()