<script lang="ts">
</script>

<main>
        <h1>Privacy Policy</h1>
        <p class="meta">Effective Date: January 1, 2026</p>

        <section>
                <h2>Introduction</h2>
                <p>
                        Year Planner ("we", "our", or "us") operates the website https://felixsargent.com/year-planner (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of Personal Information when you use our Service.                                                   
                </p>
        </section>

        <section>
                <h2>Information We Collect</h2>
                <p>
                        We do not collect or store any personal data on our servers. This application is a "local-first" application, meaning your data stays on your device.                                                                   
                </p>
                <h3>Google User Data</h3>
                <p>
                        Our application accesses your Google Calendar data to display your events in a year-at-a-glance view. This access is obtained via the Google OAuth 2.0 API.                                                             
                </p>
                <ul>
                        <li><strong>Calendars:</strong> We list your calendars to allow you to select which ones to display.</li>                               
                        <li><strong>Events:</strong> We read your calendar events to display them on the grid.</li>                                             
                </ul>
                <p>
                        This data is stored locally in your browser's local storage for performance and offline capability. It is <strong>never</strong> sent to our servers or any third parties other than Google (as part of the API request).                                                                               
                </p>
        </section>

        <section>
                <h2>How We Use Your Data</h2>
                <p>
                        We use the information solely to provide the functionality of the Service:                                                              
                </p>
                <ul>
                        <li>Displaying your schedule in a yearly view.</li>
                        <li>Remembering your preferences (e.g., selected calendars, theme).</li>                                                                
                </ul>
        </section>

        <section>
                <h2>Data Sharing, Transfer, and Disclosure</h2>
                <p>
                        We do not share, transfer, or disclose your Google user data to any third parties, except as necessary to provide the Service:
                </p>
                <ul>
                        <li><strong>Google:</strong> We only interact with Google's API to retrieve your calendar data. This interaction is necessary for the Service to function and is governed by Google's own privacy policies and terms of service.</li>
                        <li><strong>No Third Parties:</strong> We do not sell, rent, or share your Google user data with advertisers, data brokers, analytics services, or any other third parties.</li>
                        <li><strong>No Backend Servers:</strong> We operate no backend servers that receive or store your Google user data. All data remains on your device.</li>
                        <li><strong>No Data Transfers:</strong> Your Google user data is never transferred to any external systems, servers, or services operated by us or third parties.</li>
                </ul>
                <p>
                        Your Google user data is accessed only through Google's official OAuth 2.0 API and stored exclusively in your browser's local storage on your device.
                </p>
        </section>

        <section>
                <h2>Data Storage and Security</h2>
                <p>
                        Your data is stored on your own device. We implement no backend storage for your calendar data. You can clear your data at any time by clearing your browser cache or signing out within the application.               
                </p>
        </section>

        <section>
                <h2>Data Protection Mechanisms</h2>
                <p>
                        We implement the following mechanisms to protect your sensitive Google user data:
                </p>
                <ul>
                        <li><strong>Local Storage Only:</strong> All Google user data (calendar events, calendar lists) is stored exclusively in your browser's local storage on your device. This data never leaves your device except when making API requests to Google's servers.</li>
                        <li><strong>HTTPS Encryption:</strong> All communication with Google's API is conducted over HTTPS, ensuring that data in transit is encrypted and protected from interception.</li>
                        <li><strong>OAuth 2.0 Security:</strong> We use Google's OAuth 2.0 protocol for secure authentication and authorization. Access tokens are stored locally and are not shared with any third parties.</li>
                        <li><strong>No Server-Side Storage:</strong> We maintain no servers, databases, or cloud storage systems that could store or expose your Google user data.</li>
                        <li><strong>Browser Security:</strong> Your data benefits from your browser's built-in security features, including same-origin policy protections and secure storage mechanisms.</li>
                        <li><strong>User Control:</strong> You can revoke access at any time through your Google Account settings, which immediately stops all data access. You can also clear all locally stored data by clearing your browser's local storage or signing out of the application.</li>
                        <li><strong>Read-Only Access:</strong> Our application requests only read-only access to your calendar data. We cannot modify, delete, or create calendar events, reducing the risk of unauthorized changes to your data.</li>
                </ul>
                <p>
                        While we implement these protections, you should also ensure your device and browser are kept up to date with security patches, and that you use strong authentication methods for your Google account.
                </p>
        </section>

        <section>
                <h2>Third-Party Services</h2>
                <p>
                        <strong>Google OAuth:</strong> We use Google for authentication and authorization. Please refer to <a href="https://policies.google.com/privacy" target="_blank">Google's Privacy Policy</a> for more information on how they handle your data.                                                         
                </p>
        </section>

        <section>
                <h2>Your Rights</h2>
                <p>
                        You may revoke our access to your Google Calendar at any time via your <a href="https://myaccount.google.com/permissions" target="_blank">Google Account Permissions</a> page.                                          
                </p>
        </section>

        <section>
                <h2>Contact Us</h2>
                <p>
                        If you have any questions about this Privacy Policy, please contact us via <a href="https://felixsargent.com">felixsargent.com</a>.     
                </p>
        </section>

    <footer class="controls">
        <a href="../">Back to App</a> &bull; <a href="../about">About</a> &bull; <a href="../terms">Terms</a>
    </footer>
</main>

<style>
        main {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px 20px;
                font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;                                                                            
                color: var(--text);
                line-height: 1.6;
        height: 100vh;
        overflow-y: auto;
        box-sizing: border-box;
        }

        h1 {
                font-size: 2rem;
                margin-bottom: 0.5rem;
        }

        h2 {
                margin-top: 2rem;
                font-size: 1.5rem;
                border-bottom: 1px solid var(--border);
                padding-bottom: 0.5rem;
        }

        h3 {
                font-size: 1.2rem;
                margin-top: 1.5rem;
        }

        p, li {
                color: var(--text);
                font-size: 1rem;
        }
    
    a {
        color: var(--focus);
    }

        .meta {
                color: var(--muted);
                font-size: 0.9rem;
        }
    
    .controls {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid var(--border);
    }
</style>
