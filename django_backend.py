# Real Django Backend for Webscraper Frontend
# This creates a working Django API that matches the frontend expectations

import os
import sys
import json
import random
from datetime import datetime, timedelta

# Set Django settings module before importing Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', '__main__')

import django
from django.conf import settings
from django.http import JsonResponse
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# Django Settings Configuration
if not settings.configured:
    settings.configure(
        DEBUG=True,
        SECRET_KEY='django-insecure-local-development-key-change-in-production',
        ALLOWED_HOSTS=['*'],
        INSTALLED_APPS=[
            'corsheaders',
        ],
        MIDDLEWARE=[
            'corsheaders.middleware.CorsMiddleware',
            'django.middleware.common.CommonMiddleware',
        ],
        ROOT_URLCONF=__name__,
        DATABASES={
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': ':memory:',  # In-memory database for simplicity
            }
        },
        STATIC_URL='/static/',
        USE_TZ=True,
        USE_I18N=False,
        # CORS Settings
        CORS_ALLOW_ALL_ORIGINS=True,
        CORS_ALLOW_CREDENTIALS=True,
        CORS_ALLOWED_HEADERS=[
            'accept',
            'accept-encoding',
            'authorization',
            'content-type',
            'dnt',
            'origin',
            'user-agent',
            'x-csrftoken',
            'x-requested-with',
        ],
    )

django.setup()

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

# In-memory storage for articles (in production, this would be a real database)
ARTICLES_CACHE = {}

def get_articles_for_search(search_term):
    """Get or generate articles for a search term"""
    if search_term not in ARTICLES_CACHE:
        ARTICLES_CACHE[search_term] = generate_sample_articles(search_term)
    return ARTICLES_CACHE[search_term]

# API Views
@csrf_exempt
@require_http_methods(["GET"])
def articles_search(request, search, first, last, order_by):
    """
    API endpoint: /articles/search/{search}/{first}/{last}/{order_by}
    Returns paginated articles matching the search term
    """
    try:
        first = int(first)
        last = int(last)
        
        # Get articles for this search term
        all_articles = get_articles_for_search(search)
        
        # Sort articles based on order_by parameter
        if order_by.lower() == 'desc':
            all_articles.sort(key=lambda x: x['published_date'], reverse=True)
        else:
            all_articles.sort(key=lambda x: x['published_date'])
        
        # Get the requested slice
        articles_slice = all_articles[first:last]
        
        return JsonResponse({
            "message": "Articles retrieved successfully",
            "status": "success",
            "data": articles_slice
        })
        
    except Exception as e:
        return JsonResponse({
            "message": f"Error retrieving articles: {str(e)}",
            "status": "error",
            "data": []
        }, status=500)

@csrf_exempt  
@require_http_methods(["GET"])
def articles_count(request, search):
    """
    API endpoint: /articles/results/{search}
    Returns the total count of articles for a search term
    """
    try:
        # Get articles for this search term
        articles = get_articles_for_search(search)
        count = len(articles)
        
        return JsonResponse({
            "message": "Count retrieved successfully", 
            "status": "success",
            "data": {"count": count}
        })
        
    except Exception as e:
        return JsonResponse({
            "message": f"Error retrieving count: {str(e)}",
            "status": "error",
            "data": {"count": 0}
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """Health check endpoint"""
    return JsonResponse({
        "message": "Webscraper API is running",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })

# URL Configuration
urlpatterns = [
    path('articles/search/<str:search>/<int:first>/<int:last>/<str:order_by>/', articles_search, name='articles_search'),
    path('articles/results/<str:search>/', articles_count, name='articles_count'),
    path('health/', health_check, name='health_check'),
    path('', health_check, name='root'),
]

# Development server runner
def run_server():
    """Run the Django development server"""
    print("🚀 Starting Real Django Backend for Webscraper...")
    print("📊 Generating sample data for testing...")
    
    # Pre-populate some common search terms
    common_terms = ['technology', 'ai', 'python', 'react', 'django', 'javascript']
    for term in common_terms:
        get_articles_for_search(term)
    
    print("✅ Sample data ready!")
    print("🌐 Starting server on http://localhost:8000")
    print("📡 API Endpoints:")
    print("   - Search: http://localhost:8000/articles/search/{search}/{first}/{last}/{order}")
    print("   - Count: http://localhost:8000/articles/results/{search}")
    print("   - Health: http://localhost:8000/health/")
    print("🎯 Frontend should be configured to use: http://localhost:8000")
    print("Press Ctrl+C to stop the server")
    
    # Start Django development server
    from django.core.management.commands.runserver import Command as RunServerCommand
    from django.core.management.base import CommandParser
    
    # Simple HTTP server alternative if Django fails
    try:
        from django.core.management import execute_from_command_line
        execute_from_command_line(['manage.py', 'runserver', '0.0.0.0:8000'])
    except Exception as e:
        print(f"⚠️  Django server failed: {e}")
        print("🔄 Starting simple HTTP server instead...")
        start_simple_server()

def start_simple_server():
    """Start a simple HTTP server as fallback"""
    from http.server import HTTPServer, BaseHTTPRequestHandler
    import urllib.parse
    
    class WebscraperHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            # Parse the URL
            parsed_path = urllib.parse.urlparse(self.path)
            path_parts = parsed_path.path.strip('/').split('/')
            
            # Enable CORS
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', '*')
            
            # Route handling
            if len(path_parts) >= 5 and path_parts[0] == 'articles' and path_parts[1] == 'search':
                # /articles/search/{search}/{first}/{last}/{order}
                search = path_parts[2]
                first = int(path_parts[3])
                last = int(path_parts[4])
                order_by = path_parts[5] if len(path_parts) > 5 else 'asc'
                
                # Get articles
                all_articles = get_articles_for_search(search)
                if order_by.lower() == 'desc':
                    all_articles.sort(key=lambda x: x['published_date'], reverse=True)
                else:
                    all_articles.sort(key=lambda x: x['published_date'])
                
                articles_slice = all_articles[first:last]
                response = {
                    "message": "Articles retrieved successfully",
                    "status": "success", 
                    "data": articles_slice
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
            elif len(path_parts) >= 3 and path_parts[0] == 'articles' and path_parts[1] == 'results':
                # /articles/results/{search}
                search = path_parts[2]
                articles = get_articles_for_search(search)
                response = {
                    "message": "Count retrieved successfully",
                    "status": "success",
                    "data": {"count": len(articles)}
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
            elif path_parts[0] == 'health' or self.path == '/':
                # Health check
                response = {
                    "message": "Webscraper API is running",
                    "status": "healthy", 
                    "timestamp": datetime.now().isoformat()
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
            else:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Not found"}).encode())
        
        def do_OPTIONS(self):
            # Handle CORS preflight
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', '*')
            self.end_headers()
    
    # Start simple HTTP server
    server = HTTPServer(('0.0.0.0', 8000), WebscraperHandler)
    print("🌐 Simple HTTP server running on http://localhost:8000")
    server.serve_forever()

if __name__ == '__main__':
    # Try Django first, fall back to simple server
    try:
        django.setup()
        run_server()
    except Exception as e:
        print(f"⚠️  Django setup failed: {e}")
        print("🔄 Starting with simple HTTP server...")
        
        # Pre-populate some sample data
        common_terms = ['technology', 'ai', 'python', 'react', 'django', 'javascript']
        for term in common_terms:
            get_articles_for_search(term)
        print("✅ Sample data ready!")
        
        start_simple_server()