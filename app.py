import os, datetime
import pickle
import re
import requests
#import webapp2
#from google.appengine.ext.webapp import template
#from samplelib import samplemodule

from flask import Flask, request, render_tempolate, redirect, abort, jsonify

import models

app = Flask(__name__) 
app.config['CSRF_ENABLED'] = False

app.logger.debug("Begins!")


@app.route("/")
def index():
    return render_template('index.html')


@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'), 404


if __name__ == "__main__":
    app.debug = True

    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

