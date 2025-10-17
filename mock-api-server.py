#!/usr/bin/env python3
"""
Simple Mock API Server for Webscraper Frontend Testing
This creates a lightweight API that matches the expected endpoints.
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
from datetime import datetime, timedelta
import random

class MockAPIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parse URL and query parameters
        parsed_url = urllib.parse.urlparse(self.path)
        path_parts = parsed_url.path.strip('/').split('/')
        
        # Enable CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        
        try:
            if path_parts[0] == 'articles':
                if len(path_parts) >= 2 and path_parts[1] == 'search':
                    # /articles/search/{search}/{first}/{last}/{orderBy}
                    self.handle_articles_search(path_parts)
                elif len(path_parts) >= 2 and path_parts[1] == 'results':
                    # /articles/results/{search}
                    self.handle_articles_count(path_parts)
                else:
                    self.send_error_response(404, "Endpoint not found")
            else:
                self.send_error_response(404, "API endpoint not found")
        except Exception as e:
            self.send_error_response(500, f"Server error: {str(e)}")

    def do_OPTIONS(self):
        # Handle preflight requests for CORS
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def handle_articles_search(self, path_parts):
        # /articles/search/{search}/{first}/{last}/{orderBy}
        if len(path_parts) < 6:
            self.send_error_response(400, "Invalid search parameters")
            return
            
        search_term = path_parts[2]
        first = int(path_parts[3])
        last = int(path_parts[4])
        order_by = path_parts[5]
        
        # Generate mock articles
        articles = self.generate_mock_articles(search_term, first, last, order_by)
        
        response = {
            "message": "Articles retrieved successfully",
            "status": "success",
            "data": articles
        }
        
        self.send_json_response(200, response)

    def handle_articles_count(self, path_parts):
        # /articles/results/{search}
        if len(path_parts) < 3:
            self.send_error_response(400, "Invalid count parameters")
            return
            
        search_term = path_parts[2]
        
        # Mock count based on search term
        count = random.randint(50, 500) if search_term else 0
        
        response = {
            "message": "Count retrieved successfully",
            "status": "success", 
            "data": {"count": count}
        }
        
        self.send_json_response(200, response)

    def generate_mock_articles(self, search_term, first, last, order_by):
        articles = []
        num_articles = min(last - first, 20)  # Limit to 20 articles per request
        
        sample_words = [
            "technology", "innovation", "digital", "software", "development", "artificial", 
            "intelligence", "machine", "learning", "data", "analytics", "cloud", "computing",
            "cybersecurity", "blockchain", "automation", "programming", "algorithm", "database"
        ]
        
        for i in range(num_articles):
            # Create mock published date
            days_ago = random.randint(1, 365)
            pub_date = (datetime.now() - timedelta(days=days_ago)).isoformat()
            
            # Generate word cloud data
            word_count = random.randint(10, 20)
            words = random.sample(sample_words, word_count)
            scores = [str(round(random.uniform(0.1, 1.0), 2)) for _ in words]
            
            article = {
                "url": f"https://example.com/article-{search_term}-{first + i}",
                "title": f"{search_term.title()} in Modern Technology - Article {first + i + 1}",
                "body": f"This is a detailed article about {search_term} and its impact on modern technology. " * 10,
                "article_summary": f"A comprehensive overview of {search_term} and its applications in today's digital landscape.",
                "list_of_keywords": f"{search_term}, technology, innovation, digital transformation",
                "wordcloud_words": " ".join(words),
                "wordcloud_scores": " ".join(scores),
                "created_date": datetime.now().isoformat(),
                "published_date": pub_date
            }
            articles.append(article)
        
        # Sort by published_date based on order_by
        if order_by == 'desc':
            articles.sort(key=lambda x: x['published_date'], reverse=True)
        else:
            articles.sort(key=lambda x: x['published_date'])
            
        return articles

    def send_json_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def send_error_response(self, status_code, message):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        error_response = {
            "message": message,
            "status": "error",
            "data": None
        }
        self.wfile.write(json.dumps(error_response).encode('utf-8'))

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, MockAPIHandler)
    print(f"🚀 Mock API Server running on http://localhost:{port}")
    print(f"📡 Test endpoint: http://localhost:{port}/articles/results/test")
    print(f"🎯 Frontend configured to use: http://localhost:{port}")
    print("Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
        httpd.server_close()

if __name__ == '__main__':
    run_server(8000)