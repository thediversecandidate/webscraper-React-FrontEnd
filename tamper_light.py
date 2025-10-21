#!/usr/bin/env python3
"""
TRUST PROTOCOL TAMPER LIGHT INDICATOR
========================================

This script monitors the integrity of TRUST_PROTOCOL.md and provides visual
tamper detection. Red indicates tampering, green indicates integrity verified.

USAGE:
    python tamper_light.py

The script will:
1. Check protocol integrity on startup
2. Display visual tamper indicator
3. Monitor for changes during execution
4. Alert user to any modifications
"""

import hashlib
import os
import time
import json
from pathlib import Path
from datetime import datetime

class TamperLight:
    def __init__(self, protocol_file="TRUST_PROTOCOL.md", hash_file=".protocol_hash.json"):
        self.protocol_file = Path(protocol_file)
        self.hash_file = Path(hash_file)
        self.original_hash = None
        self.last_check = None
        self.is_tampered = False

    def calculate_hash(self, content):
        """Calculate SHA-256 hash of protocol content"""
        return hashlib.sha256(content.encode('utf-8')).hexdigest()

    def load_stored_hash(self):
        """Load previously stored hash"""
        if self.hash_file.exists():
            try:
                with open(self.hash_file, 'r') as f:
                    data = json.load(f)
                    return data.get('hash'), data.get('timestamp')
            except (json.JSONDecodeError, KeyError):
                return None, None
        return None, None

    def store_hash(self, hash_value):
        """Store hash with timestamp"""
        data = {
            'hash': hash_value,
            'timestamp': datetime.now().isoformat(),
            'file': str(self.protocol_file)
        }
        with open(self.hash_file, 'w') as f:
            json.dump(data, f, indent=2)

    def check_integrity(self):
        """Check if protocol file has been tampered with"""
        if not self.protocol_file.exists():
            print("❌ TRUST PROTOCOL FILE MISSING!")
            return False

        try:
            with open(self.protocol_file, 'r', encoding='utf-8') as f:
                current_content = f.read()
        except Exception as e:
            print(f"❌ ERROR READING PROTOCOL FILE: {e}")
            return False

        current_hash = self.calculate_hash(current_content)
        stored_hash, timestamp = self.load_stored_hash()

        self.last_check = datetime.now()

        if stored_hash is None:
            # First run - establish baseline
            self.store_hash(current_hash)
            self.original_hash = current_hash
            print("🔒 TRUST PROTOCOL BASELINE ESTABLISHED")
            return True

        if current_hash == stored_hash:
            self.is_tampered = False
            return True
        else:
            self.is_tampered = True
            return False

    def display_indicator(self):
        """Display visual tamper indicator"""
        if self.is_tampered:
            print("\n" + "="*60)
            print("🔴 🔴 🔴 TAMPER LIGHT: RED - PROTOCOL MODIFIED! 🔴 🔴 🔴")
            print("="*60)
            print("⚠️  TRUST PROTOCOL INTEGRITY COMPROMISED!")
            print("⚠️  The protocol file has been modified without authorization.")
            print("⚠️  This may indicate tampering or unauthorized changes.")
            print()
            print("🔍 INVESTIGATION REQUIRED:")
            print("   - Review recent changes to TRUST_PROTOCOL.md")
            print("   - Verify all modifications are authorized")
            print("   - Re-establish baseline if changes are legitimate")
            print()
            print("❓ USER ACTION REQUIRED:")
            print("   Do you want to:")
            print("   1. Accept these changes (update baseline)")
            print("   2. Reject changes (restore original)")
            print("   3. Investigate further")
            print("="*60 + "\n")
        else:
            print("\n" + "="*60)
            print("🟢 🟢 🟢 TAMPER LIGHT: GREEN - PROTOCOL SECURE 🟢 🟢 🟢")
            print("="*60)
            print("✅ Trust Protocol integrity verified")
            print(f"📅 Last check: {self.last_check.strftime('%Y-%m-%d %H:%M:%S') if self.last_check else 'Never'}")
            print("🔒 Protocol is secure and unmodified")
            print("="*60 + "\n")

    def prompt_user_for_modification(self):
        """Prompt user before allowing any protocol modifications"""
        print("\n" + "="*70)
        print("🔐 TAMPER LIGHT ACTIVATION: TRUST PROTOCOL MODIFICATION REQUEST")
        print("="*70)
        print("⚠️  The Trust Protocol requires explicit user authorization for changes.")
        print("� Current Status: GREEN - Protocol is secure")
        print()
        print("❓ Do you want to modify the Trust Protocol? (y/n): ")

        try:
            response = input().strip().lower()
            if response == 'y' or response == 'yes':
                print("✅ Modification authorized. You may proceed with changes.")
                print("🔄 Remember to run tamper_light.py after modifications to update baseline.")
                return True
            else:
                print("❌ Modification blocked. Protocol remains secure.")
                print("🔒 No changes will be made to the Trust Protocol.")
                return False
        except KeyboardInterrupt:
            print("\n❌ Modification cancelled by user.")
            return False

    def prompt_user_action(self):
        """Prompt user for action when tampering detected"""
        if not self.is_tampered:
            return

        while True:
            try:
                choice = input("Enter your choice (1-3): ").strip()
                if choice == "1":
                    print("🔄 Updating baseline with current protocol...")
                    with open(self.protocol_file, 'r', encoding='utf-8') as f:
                        current_content = f.read()
                    current_hash = self.calculate_hash(current_content)
                    self.store_hash(current_hash)
                    self.is_tampered = False
                    print("✅ Baseline updated. Protocol integrity restored.")
                    break
                elif choice == "2":
                    print("❌ User rejected changes. Protocol remains compromised.")
                    print("🔍 Manual investigation required.")
                    break
                elif choice == "3":
                    print("🔍 Entering investigation mode...")
                    self.investigate_changes()
                    break
                else:
                    print("❌ Invalid choice. Please enter 1, 2, or 3.")
            except KeyboardInterrupt:
                print("\n❌ Investigation cancelled by user.")
                break

    def investigate_changes(self):
        """Provide detailed investigation of changes"""
        print("\n🔍 PROTOCOL INVESTIGATION REPORT")
        print("="*50)

        stored_hash, timestamp = self.load_stored_hash()
        print(f"Stored hash (baseline): {stored_hash}")
        print(f"Baseline timestamp: {timestamp}")

        if self.protocol_file.exists():
            with open(self.protocol_file, 'r', encoding='utf-8') as f:
                current_content = f.read()
            current_hash = self.calculate_hash(current_content)
            print(f"Current hash: {current_hash}")
            print(f"File size: {len(current_content)} characters")

            # Show diff if possible
            print("\n📋 RECOMMENDED ACTIONS:")
            print("1. Compare with git history: git log --oneline TRUST_PROTOCOL.md")
            print("2. Check file permissions: ls -la TRUST_PROTOCOL.md")
            print("3. Review recent modifications manually")
        else:
            print("❌ Protocol file is missing!")

        print("\n❓ Ready to make a decision?")
        print("1. Accept changes (update baseline)")
        print("2. Reject changes (keep current baseline)")
        print("3. Exit investigation")
        
        try:
            choice = input("Enter your choice (1-3): ").strip()
            if choice == "1":
                print("🔄 Updating baseline with current protocol...")
                with open(self.protocol_file, 'r', encoding='utf-8') as f:
                    current_content = f.read()
                current_hash = self.calculate_hash(current_content)
                self.store_hash(current_hash)
                self.is_tampered = False
                print("✅ Baseline updated. Protocol integrity restored.")
            elif choice == "2":
                print("❌ Changes rejected. Protocol remains in tampered state.")
            else:
                print("✅ Investigation complete.")
        except KeyboardInterrupt:
            print("\n❌ Investigation cancelled by user.")

    def monitor_mode(self, interval_seconds=300):
        """Monitor protocol integrity continuously"""
        print("🔍 Starting tamper light monitoring mode...")
        print(f"📊 Check interval: {interval_seconds} seconds")
        print("Press Ctrl+C to stop monitoring\n")

        try:
            while True:
                if self.check_integrity():
                    self.display_indicator()
                else:
                    self.display_indicator()
                    self.prompt_user_action()

                time.sleep(interval_seconds)

        except KeyboardInterrupt:
            print("\n🛑 Monitoring stopped by user.")
            print("🔒 Final integrity check:")
            self.check_integrity()
            self.display_indicator()

def main():
    """Main function"""
    print("🔐 TRUST PROTOCOL TAMPER LIGHT v1.0")
    print("====================================")

    tamper_light = TamperLight()

    # Check command line arguments for modification mode
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--modify":
        # User is requesting to modify the protocol
        authorized = tamper_light.prompt_user_for_modification()
        if not authorized:
            sys.exit(1)  # Exit with error code to block modifications
        sys.exit(0)  # Exit successfully if authorized

    # Initial check
    print("🔍 Performing initial integrity check...")
    is_secure = tamper_light.check_integrity()
    tamper_light.display_indicator()

    if tamper_light.is_tampered:
        tamper_light.prompt_user_action()

    # Ask user if they want monitoring mode
    try:
        choice = input("Start continuous monitoring mode? (y/n): ").strip().lower()
        if choice == 'y':
            tamper_light.monitor_mode()
        else:
            print("✅ Single check completed. Run again anytime to verify integrity.")
    except KeyboardInterrupt:
        print("\n✅ Check completed.")

if __name__ == "__main__":
    main()