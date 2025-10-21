#!/usr/bin/env python3
"""
Flask-based Mock Semantic Web Mining Engine
Production-ready server for testing frontend integration
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import sys

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def generate_mock_articles(search_term, count=5):
    """Generate mock articles for testing"""
    articles = []
    for i in range(count):
        articles.append({
            "id": f"mock_{i+1}",
            "title": f"{search_term.title()} Article {i+1}",
            "description": f"This is a mock article about {search_term}. It contains relevant information for testing the frontend display and functionality. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            "url": f"https://example.com/article-{i+1}",
            "published_date": f"2024-10-{16-i:02d}T12:00:00Z",
            "source": f"MockSource{i+1}",
            "wordcloud_words": f"{search_term} technology innovation development learning tutorial guide example implementation",
            "wordcloud_scores": "0.9 0.8 0.7 0.6 0.5 0.4 0.3 0.2 0.1"
        })
    return articles

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    print(f"🔍 Health check request from {request.remote_addr}")
    
    return jsonify({
        "message": "Flask Mock Semantic Engine Online",
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "mode": "FLASK_MOCK_TESTING",
        "server": "Production-Ready Flask",
        "endpoints": {
            "search": "/articles/search/{search}/{first}/{last}/{order}",
            "count": "/articles/results/{search}",
            "health": "/health"
        }
    })

@app.route('/articles/search/<search>/<int:first>/<int:last>/<order>', methods=['GET'])
def search_articles(search, first, last, order):
    """Search articles endpoint"""
    print(f"🧠 Mock search: '{search}' [{first}:{last}] order={order}")
    
    # Generate mock articles
    all_articles = generate_mock_articles(search, 20)
    
    # Sort articles
    if order.lower() == 'desc':
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
        "mock_mode": True,
        "server": "Flask"
    }
    
    return jsonify(response)

@app.route('/articles/results/<search>', methods=['GET'])
def count_articles(search):
    """Count articles endpoint"""
    print(f"🔢 Mock count for: '{search}'")
    
    return jsonify({
        "search_term": search,
        "total_articles": 20,  # Mock count
        "mock_mode": True,
        "server": "Flask"
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "message": "Endpoint not found",
        "status": "error",
        "available_endpoints": [
            "/articles/search/{search}/{first}/{last}/{order}",
            "/articles/results/{search}",
            "/health"
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "message": f"Internal server error: {str(error)}",
        "status": "error",
        "mock_mode": True
    }), 500

if __name__ == "__main__":
    print("🧪 FLASK MOCK SEMANTIC WEB MINING ENGINE")
    print("=" * 50)
    print("🎯 Purpose: Test frontend/backend integration")
    print("📊 Returns: Mock data for development")
    print("⚡ Server: Production-ready Flask with CORS")
    print("🔄 Concurrent: Handles multiple requests properly")
    print()
    print("✅ Flask Mock Engine Ready!")
    print("🌐 Starting server on http://localhost:8080")
    print()
    print("📡 Flask Mock API Endpoints:")
    print("   🧠 Mock Search: GET /articles/search/{search}/{first}/{last}/{order}")
    print("   🔢 Mock Count: GET /articles/results/{search}")
    print("   💚 Health Check: GET /health")
    print()
    print("⏹️  Press Ctrl+C to stop the Flask mock engine")
    print("=" * 50)
    
    try:
        # Use threaded=True for concurrent request handling
        app.run(host='localhost', port=8080, debug=False, threaded=True)
    except KeyboardInterrupt:
        print("\n🛑 Flask mock engine stopped")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Flask server error: {e}")
        sys.exit(1)