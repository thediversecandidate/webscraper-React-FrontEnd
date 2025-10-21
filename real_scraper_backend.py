#!/usr/bin/env python3
"""
Real Web Scraping API Server for Webscraper Frontend
Scrapes actual articles from real websites and generates word clouds
"""

import json
import random
import re
import requests
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse
import sys
from bs4 import BeautifulSoup
from collections import Counter
import time
from urllib.robotparser import RobotFileParser

# Real web scraping functionality
class WebScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
    def search_news_api(self, query, max_articles=50):
        """Search for real articles using NewsAPI or similar free services"""
        articles = []
        
        # Try multiple real news sources
        sources = [
            self._search_reddit_news(query),
            self._search_hackernews(query),
            self._search_dev_to(query),
            self._search_github_trending(query)
        ]
        
        for source_articles in sources:
            articles.extend(source_articles)
            if len(articles) >= max_articles:
                break
                
        return articles[:max_articles]
    
    def _search_reddit_news(self, query):
        """Search Reddit for news articles"""
        articles = []
        try:
            # Use Reddit's JSON API (no authentication needed for public posts)
            url = f"https://www.reddit.com/search.json?q={urllib.parse.quote(query)}&sort=hot&limit=25"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                for post in data.get('data', {}).get('children', []):
                    post_data = post.get('data', {})
                    if post_data.get('selftext') and len(post_data.get('selftext', '')) > 100:
                        article = self._create_article_from_reddit(post_data, query)
                        if article:
                            articles.append(article)
        except Exception as e:
            print(f"Reddit search error: {e}")
            
        return articles
    
    def _search_hackernews(self, query):
        """Search Hacker News for tech articles"""
        articles = []
        try:
            # Use HN Algolia API
            url = f"https://hn.algolia.com/api/v1/search?query={urllib.parse.quote(query)}&tags=story"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                for hit in data.get('hits', []):
                    article = self._create_article_from_hn(hit, query)
                    if article:
                        articles.append(article)
        except Exception as e:
            print(f"HackerNews search error: {e}")
            
        return articles
    
    def _search_dev_to(self, query):
        """Search Dev.to for developer articles"""
        articles = []
        try:
            # Use Dev.to API
            url = f"https://dev.to/api/articles?tag={urllib.parse.quote(query)}&per_page=20"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                for article_data in data:
                    article = self._create_article_from_devto(article_data, query)
                    if article:
                        articles.append(article)
        except Exception as e:
            print(f"Dev.to search error: {e}")
            
        return articles
    
    def _search_github_trending(self, query):
        """Search GitHub for trending repositories related to query"""
        articles = []
        try:
            # GitHub API search
            url = f"https://api.github.com/search/repositories?q={urllib.parse.quote(query)}&sort=stars&order=desc&per_page=10"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                for repo in data.get('items', []):
                    article = self._create_article_from_github(repo, query)
                    if article:
                        articles.append(article)
        except Exception as e:
            print(f"GitHub search error: {e}")
            
        return articles
    
    def _create_article_from_reddit(self, post_data, query):
        """Convert Reddit post to article format"""
        try:
            title = post_data.get('title', '')
            body = post_data.get('selftext', '')
            url = f"https://reddit.com{post_data.get('permalink', '')}"
            created_utc = post_data.get('created_utc', time.time())
            
            if len(body) < 50:  # Skip short posts
                return None
                
            # Generate word cloud from title and body
            text = f"{title} {body}".lower()
            words, scores = self._generate_wordcloud_data(text, query)
            
            return {
                "url": url,
                "title": title,
                "body": body[:2000],  # Limit body length
                "article_summary": f"Reddit discussion about {query}: {title[:100]}...",
                "list_of_keywords": f"{query}, reddit, discussion, community",
                "wordcloud_words": " ".join(words),
                "wordcloud_scores": " ".join(map(str, scores)),
                "created_date": datetime.fromtimestamp(created_utc).isoformat(),
                "published_date": datetime.fromtimestamp(created_utc).isoformat(),
                "source": "Reddit"
            }
        except Exception:
            return None
    
    def _create_article_from_hn(self, hit, query):
        """Convert HN story to article format"""
        try:
            title = hit.get('title', '')
            url = hit.get('url', f"https://news.ycombinator.com/item?id={hit.get('story_id')}")
            created_at = hit.get('created_at', datetime.now().isoformat())
            
            # Try to get article content if URL is available
            body = ""
            if hit.get('url') and not hit.get('url').startswith('https://news.ycombinator.com'):
                body = self._scrape_article_content(hit.get('url'))
            
            if not body:
                body = f"Hacker News discussion: {title}"
            
            # Generate word cloud
            text = f"{title} {body}".lower()
            words, scores = self._generate_wordcloud_data(text, query)
            
            return {
                "url": url,
                "title": title,
                "body": body[:2000],
                "article_summary": f"Hacker News article about {query}: {title[:100]}...",
                "list_of_keywords": f"{query}, hackernews, technology, startup",
                "wordcloud_words": " ".join(words),
                "wordcloud_scores": " ".join(map(str, scores)),
                "created_date": created_at,
                "published_date": created_at,
                "source": "Hacker News"
            }
        except Exception:
            return None
    
    def _create_article_from_devto(self, article_data, query):
        """Convert Dev.to article to our format"""
        try:
            title = article_data.get('title', '')
            description = article_data.get('description', '')
            url = article_data.get('url', '')
            published_at = article_data.get('published_at', datetime.now().isoformat())
            
            # Use description as body (Dev.to doesn't provide full content in API)
            body = description or f"Dev.to article about {query}"
            
            # Generate word cloud
            text = f"{title} {body}".lower()
            words, scores = self._generate_wordcloud_data(text, query)
            
            return {
                "url": url,
                "title": title,
                "body": body,
                "article_summary": f"Dev.to article about {query}: {title[:100]}...",
                "list_of_keywords": f"{query}, development, programming, devto",
                "wordcloud_words": " ".join(words),
                "wordcloud_scores": " ".join(map(str, scores)),
                "created_date": published_at,
                "published_date": published_at,
                "source": "Dev.to"
            }
        except Exception:
            return None
    
    def _create_article_from_github(self, repo, query):
        """Convert GitHub repo to article format"""
        try:
            title = f"{repo.get('name', '')}: {repo.get('description', '')}"
            description = repo.get('description', '')
            url = repo.get('html_url', '')
            created_at = repo.get('created_at', datetime.now().isoformat())
            updated_at = repo.get('updated_at', datetime.now().isoformat())
            
            # Create body from repo info
            body = f"GitHub repository: {description}. Stars: {repo.get('stargazers_count', 0)}, Language: {repo.get('language', 'Unknown')}"
            
            # Generate word cloud
            text = f"{title} {body} {repo.get('language', '')}".lower()
            words, scores = self._generate_wordcloud_data(text, query)
            
            return {
                "url": url,
                "title": title,
                "body": body,
                "article_summary": f"GitHub repository about {query}: {description[:100]}...",
                "list_of_keywords": f"{query}, github, opensource, {repo.get('language', '').lower()}",
                "wordcloud_words": " ".join(words),
                "wordcloud_scores": " ".join(map(str, scores)),
                "created_date": created_at,
                "published_date": updated_at,
                "source": "GitHub"
            }
        except Exception:
            return None
    
    def _scrape_article_content(self, url):
        """Scrape content from article URL"""
        try:
            response = self.session.get(url, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Remove script and style elements
                for script in soup(["script", "style"]):
                    script.decompose()
                
                # Try to find main content
                content = ""
                for tag in ['article', 'main', '.content', '.post-content', '.entry-content']:
                    element = soup.find(tag.lstrip('.'), class_=tag.lstrip('.') if tag.startswith('.') else None)
                    if element:
                        content = element.get_text()
                        break
                
                if not content:
                    # Fallback to all paragraph text
                    paragraphs = soup.find_all('p')
                    content = ' '.join([p.get_text() for p in paragraphs])
                
                return content[:2000]  # Limit length
                
        except Exception:
            pass
        
        return ""
    
    def _generate_wordcloud_data(self, text, query):
        """Generate word cloud data from text"""
        # Clean and tokenize text
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        
        # Remove common stop words
        stop_words = {
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
            'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
            'those', 'his', 'her', 'its', 'their', 'our', 'your', 'him', 'them',
            'she', 'you', 'are', 'was', 'were', 'been', 'being', 'have', 'has',
            'had', 'will', 'would', 'could', 'should', 'may', 'might', 'can'
        }
        
        # Filter words and count frequency
        filtered_words = [w for w in words if w not in stop_words and len(w) > 2]
        word_counts = Counter(filtered_words)
        
        # Ensure query term is included with high score
        if query.lower() in word_counts:
            word_counts[query.lower()] += 10
        else:
            word_counts[query.lower()] = 10
        
        # Get top words and normalize scores
        top_words = word_counts.most_common(20)
        if not top_words:
            return [query.lower()], [1.0]
        
        max_count = top_words[0][1]
        words = [word for word, count in top_words]
        scores = [round(count / max_count, 3) for word, count in top_words]
        
        return words, scores

# Global scraper instance
scraper = WebScraper()

# In-memory cache for scraped articles
ARTICLES_CACHE = {}
CACHE_TIMESTAMP = {}
CACHE_DURATION = 300  # 5 minutes

def get_articles_for_search(search_term):
    """Get real articles for a search term with caching"""
    current_time = time.time()
    
    # Check if we have cached results that are still fresh
    if (search_term in ARTICLES_CACHE and 
        search_term in CACHE_TIMESTAMP and
        current_time - CACHE_TIMESTAMP[search_term] < CACHE_DURATION):
        print(f"📋 Using cached results for '{search_term}'")
        return ARTICLES_CACHE[search_term]
    
    print(f"🔍 Scraping real articles for: '{search_term}'")
    
    # Scrape new articles
    try:
        articles = scraper.search_news_api(search_term, max_articles=100)
        
        if articles:
            ARTICLES_CACHE[search_term] = articles
            CACHE_TIMESTAMP[search_term] = current_time
            print(f"✅ Found {len(articles)} real articles for '{search_term}'")
        else:
            print(f"⚠️  No articles found for '{search_term}', generating placeholder")
            # Generate minimal placeholder if no real articles found
            articles = generate_fallback_articles(search_term)
            ARTICLES_CACHE[search_term] = articles
            CACHE_TIMESTAMP[search_term] = current_time
            
    except Exception as e:
        print(f"❌ Error scraping articles: {e}")
        # Fallback to placeholder articles
        articles = generate_fallback_articles(search_term)
        ARTICLES_CACHE[search_term] = articles
        CACHE_TIMESTAMP[search_term] = current_time
    
    return ARTICLES_CACHE[search_term]

def generate_fallback_articles(search_term):
    """Generate fallback articles when scraping fails"""
    return [{
        "url": f"https://search.example.com/q={search_term}",
        "title": f"Search results for {search_term}",
        "body": f"No real articles found for '{search_term}' at this time. This could be due to API limits, network issues, or the search term being too specific. Try a more general search term.",
        "article_summary": f"Fallback result for {search_term}",
        "list_of_keywords": f"{search_term}, search, results",
        "wordcloud_words": f"{search_term.lower()} search results no articles found",
        "wordcloud_scores": "1.0 0.8 0.6 0.4 0.3 0.2",
        "created_date": datetime.now().isoformat(),
        "published_date": datetime.now().isoformat(),
        "source": "Fallback"
    }]

class WebscraperAPIHandler(BaseHTTPRequestHandler):
    """HTTP Request Handler for Real Webscraper API"""
    
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
                
                print(f"📊 Real search: '{search}' [{first}:{last}] order={order_by}")
                
                # Get real articles
                all_articles = get_articles_for_search(search)
                
                # Sort articles
                if order_by.lower() == 'desc':
                    all_articles.sort(key=lambda x: x['published_date'], reverse=True)
                else:
                    all_articles.sort(key=lambda x: x['published_date'])
                
                # Get requested slice
                articles_slice = all_articles[first:last]
                
                response = {
                    "message": "Real articles retrieved successfully",
                    "status": "success",
                    "data": articles_slice
                }
                
                print(f"✅ Returned {len(articles_slice)} real articles")
                self.send_json_response(response)
                
            # Route: /articles/results/{search}  
            elif (len(path_parts) >= 3 and
                  path_parts[0] == 'articles' and
                  path_parts[1] == 'results'):
                
                search = urllib.parse.unquote(path_parts[2])
                print(f"🔢 Real count request for: '{search}'")
                
                articles = get_articles_for_search(search)
                count = len(articles)
                
                response = {
                    "message": "Real article count retrieved successfully",
                    "status": "success", 
                    "data": {"count": count}
                }
                
                print(f"✅ Real count: {count} articles")
                self.send_json_response(response)
                
            # Route: /health or /
            elif (len(path_parts) == 0 or 
                  (len(path_parts) == 1 and path_parts[0] == 'health')):
                
                response = {
                    "message": "Real Webscraper API is running",
                    "status": "healthy",
                    "timestamp": datetime.now().isoformat(),
                    "features": [
                        "Real web scraping from Reddit, HackerNews, Dev.to, GitHub",
                        "Dynamic word cloud generation", 
                        "Article caching (5min TTL)",
                        "Multiple data sources"
                    ],
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
    """Start the real webscraper API server"""
    print("🚀 Starting REAL Web Scraper API Server...")
    print("🌐 This server scrapes REAL articles from actual websites!")
    print("📊 Data sources: Reddit, Hacker News, Dev.to, GitHub")
    print("⚡ Features: Real-time scraping, word cloud generation, caching")
    
    print("\n✅ Real web scraper ready!")
    print("🌐 Starting server on http://localhost:8080")
    print("\n📡 Available API Endpoints:")
    print("   🔍 Search: GET /articles/search/{search}/{first}/{last}/{order}")
    print("   🔢 Count:  GET /articles/results/{search}")
    print("   💚 Health: GET /health")
    print("\n🎯 Frontend configured for: http://localhost:8080")
    print("📋 Test with real searches:")
    print("   - 'python' - Get real Python articles")
    print("   - 'javascript' - Get real JS articles") 
    print("   - 'ai' - Get real AI articles")
    print("   - 'react' - Get real React articles")
    print("\n⚠️  Note: First search may take 10-15 seconds (scraping real data)")
    print("⏹️  Press Ctrl+C to stop the server")
    print("-" * 60)
    
    try:
        # Start HTTP server
        server = HTTPServer(('0.0.0.0', 8080), WebscraperAPIHandler)
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Real webscraper server stopped by user")
        server.shutdown()
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    run_api_server()