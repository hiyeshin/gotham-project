import os, datetime, re
import pickle # a module that is used for serializing Python object
import requests

#import webapp2
#from google.appengine.ext.webapp import template
#from samplelib import samplemodule

from flask import Flask, request, render_template, redirect, abort, jsonify
from werkzeug import secure_filename

from flask.ext.mongoengine import mongoengine

import models

import boto

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



@app.route("/", methods=['GET', 'POST'])
def index():
    
    photo_upload_form = models.photo_upload_form(request.form)

    if request.method == "POST" and photo_upload_form.validate():

    	uploaded_file = request.files['fileupload']
    	app.logger.info("file uploaded")


    	# 1. Generate a file name
    	# 2. Connect to S3
    	# 3. Get the s3 bucket and put the file
    	# 4. After saving to s3, and then save data to database
    	# 5. maybe connect to application.js to make it as a texture?

    	if uploaded_file and allowed_file(uploaded_file.filename):

    		now = datetime.datetime.now()
    		filename = now.strftime('%Y%m%d%H%M%s') + "-" + secure_filename(uploaded_file.filename)
            # filename = now.strftime('%Y%m%d%H%M%s') + "-" + secure_filename(uploaded_file.filename)
    		#connect to s3
    		s3conn = boto.connect_s3(os.environ.get('AWS_ACCESS_KEY_ID'),os.environ.get('AWS_SECRET_ACCESS_KEY'))

    		# open s3 bucket, and create new Key/file
    		# set the mimetype, content and access control
    		b = s3conn.get_bucket(os.environ.get('AWS_BUCKET')) # bucket name defined in .env
    		k = b.new_key(b)
    		k.key = filename
    		k.set_metadata("Content-Type", uploaded_file.mimetype)
    		k.set_contents_from_string(uploaded_file.stream.read())
    		k.make_public()

    		# save information to MONGO database
    		# which something actually save to s3

    		if k and k.size > 0:

    			submitted_image = models.Image()
    			submitted_image.filename = filename # same filename of s3 bucket file
                
    			submitted_image.save()

    		return redirect('/')

    	else:
    		return "There was an error" + uploaded_file.filename


    else:
    	#get existing images. maybe I'll change my mind later
    	images = models.Image.objects.order_by('-timestamp')
        latest_image = images[0]

    	templateData = {
    		'images' : images,
    		'form' : photo_upload_form
    	}

        

    	return render_template("main.html", **templateData)


@app.route('/delete/<imageid>')
def delete_image(imageid):

	image = models.Image.objects.get(id=imageid)
	if image:
		s3conn = boto.connect_s3(os.environ.get('AWS_ACCESS_KEY_ID'), os.environ.get('AWS_SECRET_ACCESS_KEY'))

		bucket = s3conn.get_bucket(os.environ.get('AWS_BUCKET'))
		k = bucket.new_key(bucket)
		k.key = image.filename
		bucket.delete_key(k)

		#delete from Mongo
		image.delete()

		return redirect('/')


	else:
		return "Unable to find requested image in database."


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

