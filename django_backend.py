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
    
    # Run Django development server
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', __name__)
    execute_from_command_line(['manage.py', 'runserver', '0.0.0.0:8000'])

if __name__ == '__main__':
    run_server()