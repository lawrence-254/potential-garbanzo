#!/usr/bin/env python3
'''
'''
import csv
from typing import List, Tuple


def index_range(page: int, page_size: int) -> Tuple[int, int]:
    '''
    '''
    start = (page - 1) * page_size
    end = start + page_size
    return (start, end)

class Server:
    '''
    '''
    DATA_FILE = "Popular_Baby_Names.csv"

    def __init__(self):
        '''
        '''
        self.__dataset = None

    def dataset(self) -> List[List]:
        '''
        '''
        if self.__dataset is None:
            with open(self.DATA_FILE) as f:
                rd = csv.reader(f)
                dataset = [row for row in rd]
            self.__dataset = dataset[1:]

        return self.__dataset

    def get_page(self, page: int = 1, page_size: int = 10) -> List[List]:
        '''
        '''
        assert type(page) == int and type(page_size)==int
        assert page > o and page_size > 0
        start, end = index_range(page, page_size)
        data = self.dataset()
        if start > len(data):
            return []
        return data[start:end]