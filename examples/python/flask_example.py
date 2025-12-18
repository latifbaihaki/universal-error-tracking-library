"""
Flask integration example
"""
from flask import Flask, request
from error_tracker.integrations import FlaskIntegration

app = Flask(__name__)

# Configure error tracker
app.config['ERROR_TRACKER_DSN'] = 'console://'  # Use console transport for demo
app.config['ERROR_TRACKER_ENVIRONMENT'] = 'development'
app.config['ERROR_TRACKER_RELEASE'] = '1.0.0'

# Initialize Flask integration
integration = FlaskIntegration(app)

@app.route('/')
def index():
    return 'Hello, World!'

@app.route('/error')
def trigger_error():
    """Route that triggers an error"""
    raise ValueError('This is a test error!')

@app.route('/user/<user_id>')
def get_user(user_id):
    """Route that uses user context"""
    from error_tracker.types import User
    integration.tracker.set_user(User(id=user_id, email=f'user{user_id}@example.com'))
    return f'User {user_id}'

if __name__ == '__main__':
    app.run(debug=True)

