#!/usr/bin/env python3
"""
Standalone Python API Server for Webscraper Frontend
Pure Python HTTP server that matches the expected API interface
"""

import json
import random
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse
import sys

# Sample data generator
def generate_sample_articles(search_term, count=100):
    """Generate sample articles for testing"""
    articles = []
    
    sample_titles = [
        f"The Future of {search_term.title()} in Technology",
        f"Understanding {search_term.title()}: A Comprehensive Guide", 
        f"How {search_term.title()} is Transforming Industries",
        f"Latest Developments in {search_term.title()}",
        f"Best Practices for {search_term.title()} Implementation",
        f"{search_term.title()} Trends and Predictions for 2024",
        f"Case Study: Successful {search_term.title()} Integration",
        f"The Impact of {search_term.title()} on Business Growth",
    ]
    
    sample_words = [
        "technology", "innovation", "digital", "software", "development", "artificial",
        "intelligence", "machine", "learning", "data", "analytics", "cloud", "computing", 
        "cybersecurity", "blockchain", "automation", "programming", "algorithm", "database",
        "network", "security", "performance", "scalability", "efficiency", "optimization"
    ]
    
    for i in range(count):
        # Generate word cloud data
        word_count = random.randint(15, 25)
        words = random.sample(sample_words, min(word_count, len(sample_words)))
        # Ensure search term is included
        if search_term.lower() not in [w.lower() for w in words]:
            words[0] = search_term.lower()
        
        scores = [round(random.uniform(0.1, 1.0), 3) for _ in words]
        
        # Generate realistic dates
        days_ago = random.randint(1, 365)
        pub_date = datetime.now() - timedelta(days=days_ago)
        created_date = pub_date + timedelta(hours=random.randint(1, 48))
        
        article = {
            "url": f"https://example.com/articles/{search_term.lower()}-{i+1}",
            "title": random.choice(sample_titles),
            "body": f"This is a comprehensive article about {search_term} and its applications in modern technology. " +
                   f"The article explores various aspects including implementation, best practices, and future trends. " * 5,
            "article_summary": f"An in-depth analysis of {search_term} covering key concepts, applications, and industry impact.",
            "list_of_keywords": f"{search_term}, technology, innovation, digital transformation, automation",
            "wordcloud_words": " ".join(words),
            "wordcloud_scores": " ".join(map(str, scores)),
            "created_date": created_date.isoformat(),
            "published_date": pub_date.isoformat(),
        }
        articles.append(article)
    
    return articles

# In-memory storage for articles
ARTICLES_CACHE = {}

def get_articles_for_search(search_term):
    """Get or generate articles for a search term"""
    if search_term not in ARTICLES_CACHE:
        ARTICLES_CACHE[search_term] = generate_sample_articles(search_term)
    return ARTICLES_CACHE[search_term]

class WebscraperAPIHandler(BaseHTTPRequestHandler):
    """HTTP Request Handler for Webscraper API"""
    
    def log_message(self, format, *args):
        """Override to provide cleaner logging"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {format % args}")
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def send_cors_headers(self):
        """Send CORS headers for all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept')
        self.send_header('Content-Type', 'application/json')
    
    def send_json_response(self, data, status_code=200):
        """Send JSON response with proper headers"""
        self.send_response(status_code)
        self.send_cors_headers()
        self.end_headers()
        response_json = json.dumps(data, indent=2)
        self.wfile.write(response_json.encode('utf-8'))
    
    def do_GET(self):
        """Handle GET requests"""
        try:
            # Parse the URL
            parsed_path = urllib.parse.urlparse(self.path)
            path_parts = [p for p in parsed_path.path.strip('/').split('/') if p]
            
            print(f"🔍 Request: {self.path}")
            
            # Route: /articles/search/{search}/{first}/{last}/{order}
            if (len(path_parts) >= 5 and 
                path_parts[0] == 'articles' and 
                path_parts[1] == 'search'):
                
                search = urllib.parse.unquote(path_parts[2])
                first = int(path_parts[3])
                last = int(path_parts[4])
                order_by = path_parts[5] if len(path_parts) > 5 else 'asc'
                
                print(f"📊 Search: '{search}' [{first}:{last}] order={order_by}")
                
                # Get articles
                all_articles = get_articles_for_search(search)
                
                # Sort articles
                if order_by.lower() == 'desc':
                    all_articles.sort(key=lambda x: x['published_date'], reverse=True)
                else:
                    all_articles.sort(key=lambda x: x['published_date'])
                
                # Get requested slice
                articles_slice = all_articles[first:last]
                
                response = {
                    "message": "Articles retrieved successfully",
                    "status": "success",
                    "data": articles_slice
                }
                
                print(f"✅ Returned {len(articles_slice)} articles")
                self.send_json_response(response)
                
            # Route: /articles/results/{search}  
            elif (len(path_parts) >= 3 and
                  path_parts[0] == 'articles' and
                  path_parts[1] == 'results'):
                
                search = urllib.parse.unquote(path_parts[2])
                print(f"🔢 Count request for: '{search}'")
                
                articles = get_articles_for_search(search)
                count = len(articles)
                
                response = {
                    "message": "Count retrieved successfully",
                    "status": "success", 
                    "data": {"count": count}
                }
                
                print(f"✅ Count: {count} articles")
                self.send_json_response(response)
                
            # Route: /health or /
            elif (len(path_parts) == 0 or 
                  (len(path_parts) == 1 and path_parts[0] == 'health')):
                
                response = {
                    "message": "Webscraper API is running",
                    "status": "healthy",
                    "timestamp": datetime.now().isoformat(),
                    "endpoints": {
                        "search": "/articles/search/{search}/{first}/{last}/{order}",
                        "count": "/articles/results/{search}",
                        "health": "/health"
                    }
                }
                
                self.send_json_response(response)
                
            else:
                # 404 Not Found
                response = {
                    "message": "Endpoint not found",
                    "status": "error",
                    "path": self.path,
                    "available_endpoints": [
                        "/articles/search/{search}/{first}/{last}/{order}",
                        "/articles/results/{search}",
                        "/health"
                    ]
                }
                self.send_json_response(response, 404)
                
        except Exception as e:
            # 500 Internal Server Error
            print(f"❌ Error processing request: {e}")
            response = {
                "message": f"Internal server error: {str(e)}",
                "status": "error"
            }
            self.send_json_response(response, 500)

def run_api_server():
    """Start the API server"""
    print("🚀 Starting Webscraper API Server...")
    print("📊 Generating sample data...")
    
    # Pre-populate some common search terms
    common_terms = ['technology', 'ai', 'python', 'react', 'django', 'javascript', 'machine learning']
    for term in common_terms:
        get_articles_for_search(term)
        print(f"   ✓ Generated {len(get_articles_for_search(term))} articles for '{term}'")
    
    print("\n✅ Sample data ready!")
    print("🌐 Starting server on http://localhost:8080")
    print("\n📡 Available API Endpoints:")
    print("   🔍 Search: GET /articles/search/{search}/{first}/{last}/{order}")
    print("   🔢 Count:  GET /articles/results/{search}")
    print("   💚 Health: GET /health")
    print("\n🎯 Frontend should be configured to use: http://localhost:8080")
    print("📋 Test the API:")
    print("   curl http://localhost:8080/health")
    print("   curl http://localhost:8080/articles/results/python")
    print("   curl http://localhost:8080/articles/search/python/0/5/desc")
    print("\n⏹️  Press Ctrl+C to stop the server")
    print("-" * 60)
    
    try:
        # Start HTTP server
        server = HTTPServer(('0.0.0.0', 8080), WebscraperAPIHandler)
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        server.shutdown()
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    run_api_server()