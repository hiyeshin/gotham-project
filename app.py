import os, datetime, re
import pickle # a module that is used for serializing Python object
import requests

#import webapp2
#from google.appengine.ext.webapp import template
#from samplelib import samplemodule

from flask import Flask, request, render_template, redirect, abort, jsonify
from werkzeug import secure_filename

from flask.ext.mongoengine import mongoengine

# Below is used to use file such as images.
import StringIO


app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY')
app.config['CSRF_ENABLED'] = False
app.config['TRAP_BAD_REQUEST_ERRORS'] = True

#------------- Database Connection -----------------
# MongoDB connection to MongoLab's database

mongoengine.connect('mydata', host=os.environ.get('MONGOLAB_URI'))
app.logger.debug("Connecting to MongoLabs")

ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])



@app.route("/")
def index():
    	return render_template("main.html")


@app.route("/test")
def test():
    return render_template('test.html')


@app.route("/project")
def project():
	return render_template('project.html')


@app.route("/about")
def about():
	return render_template('about.html')


@app.route("/news")
def news():
	return render_template('news.html')


@app.route("/contact")
def contact():
	return render_template('contact.html')


@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'), 404

def allowed_file(filename):
	return '.' in filename and \
        	filename.lower().rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


if __name__ == "__main__":
    app.debug = True

    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

