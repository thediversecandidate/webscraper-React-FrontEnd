#!/usr/bin/env python3
"""
TRUTH VERIFICATION SYSTEM - Hardcoded Safeguards Against Deception
This module provides automated verification that backends are real, not mock.
"""

import os
import re
import requests
import json
from datetime import datetime
from typing import Dict, List, Tuple

class TruthVerifier:
    """Automated system to verify backend authenticity and prevent deception"""

    def __init__(self):
        self.verification_log = []
        self.mock_keywords = [
            'mock', 'fake', 'template', 'generate', 'artificial',
            'semantic_templates', 'fallback', 'placeholder'
        ]

    def verify_backend_authenticity(self, backend_file: str) -> Dict:
        """Verify that a backend file contains real functionality, not mocks"""
        print(f"🔍 Verifying authenticity of: {backend_file}")

        with open(backend_file, 'r', encoding='utf-8') as f:
            content = f.read()

        results = {
            'file': backend_file,
            'timestamp': datetime.now().isoformat(),
            'is_authentic': True,
            'issues': [],
            'mock_indicators': [],
            'real_indicators': []
        }

        # Check for mock keywords
        for keyword in self.mock_keywords:
            if keyword.lower() in content.lower():
                results['mock_indicators'].append(keyword)
                results['issues'].append(f"Found mock keyword: '{keyword}'")

        # Check for real HTTP requests
        if 'requests.get(' in content or 'requests.post(' in content:
            results['real_indicators'].append('HTTP requests detected')
        else:
            results['issues'].append("No real HTTP requests found")

        # Check for BeautifulSoup usage (real scraping)
        if 'BeautifulSoup' in content:
            results['real_indicators'].append('BeautifulSoup scraping detected')
        else:
            results['issues'].append("No BeautifulSoup scraping found")

        # Check for external URLs
        external_urls = re.findall(r'https?://[^\s\'"]+', content)
        real_news_sites = ['bbc.com', 'reuters.com', 'cnn.com', 'nytimes.com', 'guardian.com']
        found_real_sites = [url for url in external_urls if any(site in url for site in real_news_sites)]

        if found_real_sites:
            results['real_indicators'].extend([f"Real news site: {site}" for site in found_real_sites[:3]])
        else:
            results['issues'].append("No real news website URLs found")

        # Final verdict
        if len(results['issues']) > len(results['real_indicators']):
            results['is_authentic'] = False
            results['verdict'] = "🚨 HIGH RISK: Likely mock/fake backend"
        elif len(results['real_indicators']) >= 2:
            results['verdict'] = "✅ AUTHENTIC: Contains real scraping functionality"
        else:
            results['verdict'] = "⚠️  UNCERTAIN: Needs manual review"

        self.verification_log.append(results)
        return results

    def verify_api_endpoints(self, base_url: str) -> Dict:
        """Test actual API endpoints to verify they return real data"""
        print(f"🌐 Testing API endpoints at: {base_url}")

        results = {
            'base_url': base_url,
            'timestamp': datetime.now().isoformat(),
            'endpoints_tested': [],
            'real_data_found': False,
            'issues': []
        }

        # Test health endpoint
        try:
            response = requests.get(f"{base_url}/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                results['endpoints_tested'].append('/health')

                # Check if it's labeled as mock
                if data.get('mode') == 'MOCK_TESTING':
                    results['issues'].append("Health endpoint reports MOCK_TESTING mode")
                elif 'PRODUCTION' in str(data.get('mode', '')):
                    results['real_data_found'] = True
        except Exception as e:
            results['issues'].append(f"Health endpoint failed: {str(e)}")

        # Test search endpoint
        try:
            response = requests.get(f"{base_url}/articles/search/test/0/5/desc", timeout=10)
            if response.status_code == 200:
                data = response.json()
                results['endpoints_tested'].append('/articles/search')

                articles = data.get('articles', [])
                if len(articles) > 0:
                    # Check if articles have real URLs
                    real_urls = [a for a in articles if 'http' in str(a.get('url', ''))]
                    if len(real_urls) > 0:
                        results['real_data_found'] = True
                    else:
                        results['issues'].append("Articles found but no real URLs")
                else:
                    results['issues'].append("No articles returned")
        except Exception as e:
            results['issues'].append(f"Search endpoint failed: {str(e)}")

        return results

    def generate_truth_report(self) -> str:
        """Generate a comprehensive truth report"""
        report = []
        report.append("🔍 TRUTH VERIFICATION REPORT")
        report.append("=" * 50)
        report.append(f"Generated: {datetime.now().isoformat()}")
        report.append("")

        # Backend verification results
        if self.verification_log:
            report.append("📁 BACKEND FILE ANALYSIS:")
            for result in self.verification_log:
                report.append(f"File: {result['file']}")
                report.append(f"Verdict: {result['verdict']}")
                if result['issues']:
                    report.append("Issues:")
                    for issue in result['issues']:
                        report.append(f"  - {issue}")
                if result['real_indicators']:
                    report.append("Real indicators:")
                    for indicator in result['real_indicators']:
                        report.append(f"  + {indicator}")
                report.append("")

        report.append("🛡️  SAFEGUARDS IMPLEMENTED:")
        report.append("✅ Automated code scanning for mock keywords")
        report.append("✅ HTTP request verification")
        report.append("✅ External URL validation")
        report.append("✅ API endpoint testing")
        report.append("✅ Real-time authenticity checking")
        report.append("")
        report.append("📋 VERIFICATION PROTOCOL:")
        report.append("1. All backends must pass automated verification")
        report.append("2. No mock/fake/template keywords allowed in production")
        report.append("3. Real HTTP requests to external sites required")
        report.append("4. API responses must contain real URLs and data")
        report.append("5. Manual review required for uncertain cases")

        return "\n".join(report)

def main():
    """Run truth verification on current backends"""
    verifier = TruthVerifier()

    # Verify all Python backend files
    backend_files = [
        'flask_semantic_engine.py',
        'real_scraper_backend.py',
        'ai_intelligent_scraper.py'
    ]

    print("🔍 Starting Truth Verification...")
    print("=" * 50)

    for backend_file in backend_files:
        if os.path.exists(backend_file):
            result = verifier.verify_backend_authenticity(backend_file)
            print(f"📁 {backend_file}: {result['verdict']}")
            if result['issues']:
                for issue in result['issues']:
                    print(f"  ❌ {issue}")
            if result['real_indicators']:
                for indicator in result['real_indicators']:
                    print(f"  ✅ {indicator}")
        else:
            print(f"📁 {backend_file}: FILE NOT FOUND")

    # Test API endpoints if server is running
    try:
        api_result = verifier.verify_api_endpoints("http://localhost:8080")
        print("
🌐 API ENDPOINT VERIFICATION:"        print(f"Base URL: {api_result['base_url']}")
        if api_result['real_data_found']:
            print("✅ Real data detected in API responses")
        else:
            print("🚨 No real data found - possible mock backend")
        if api_result['issues']:
            for issue in api_result['issues']:
                print(f"  ❌ {issue}")
    except Exception as e:
        print(f"🌐 API testing failed: {str(e)}")

    # Generate and save report
    report = verifier.generate_truth_report()
    with open('truth_verification_report.txt', 'w', encoding='utf-8') as f:
        f.write(report)

    print("
📄 Report saved to: truth_verification_report.txt"    print("\n" + "=" * 50)
    print("🛡️  Truth verification complete. This system prevents deception by:")
    print("   • Scanning code for mock/fake indicators")
    print("   • Verifying real HTTP requests exist")
    print("   • Testing actual API responses")
    print("   • Providing automated authenticity reports")

if __name__ == "__main__":
    main()