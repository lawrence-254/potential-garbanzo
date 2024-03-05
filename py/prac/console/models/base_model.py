#!/usr/bin/env python3
'''
A class that defines all the common attributes for other classes
'''
import uuid
from datetime import datetime


class BaseModel():
    '''
    base class that is a parent class
    '''
    def __init__(self):
        self.id = str(uuid.uuid4())
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    def __str__(self):
        return f"[{self.__class__.__name__}] ({self.id}) ({self.__dict__})"

    def save(self):
        pass



ne = BaseModel()
ne.name = 'jane'
ne.address = 'gitaru'
ne.number = +254111606870
print(ne)