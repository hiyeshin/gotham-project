# -*- coding: utf-8 -*-
from flask.ext.mongoengine.wtf import model_form
from wtforms.fields import *
from flask.ext.mongoengine.wtf.orm import validators
from flask.ext.mongoengine import *
from datetime import datetime

class Image(mongoengine.Document):

	filename = mongoengine.StringField()

	timestamp = mongoengine.DateTimeField(default=datetime.now())


photo_form = model_form(Image)

# Below there's a form that inhirit the Photo model above.
# It will have all the fields of the Photo model.
# We are adding in a separate field for the file uploaded.
class photo_upload_form(photo_form):
	fileupload = FileField('Upload an image file', validators =[])