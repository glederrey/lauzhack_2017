import pandas as pd
import json
import numpy as np
from collections import Counter
from operator import itemgetter

def create_edgelist(transactions_file, clients_file, companies_file, atms_file):
    transactions = pd.read_csv(transactions_file)
    clients = pd.read_csv(clients_file)['id']
    companies = pd.read_csv(companies_file)['id']
    atms = pd.read_csv(atms_file)['id']
    all_ids = pd.concat((clients, companies, atms),axis=0)
    id_list = all_ids.values.astype(str)
    id_dict = {v:e for e,v in enumerate(id_list)}
    transaction_pairs = transactions[['source', 'target']]
    transaction_pairs['source'] = transaction_pairs.source.apply(lambda x: id_dict[x])
    transaction_pairs['target'] = transaction_pairs.target.apply(lambda x: id_dict[x])
    transactions_tuples = [(x[0], x[1]) for x in transaction_pairs.values]
    transaction_counts = Counter(transactions_tuples)
    return id_dict, transaction_counts
    
def read_node_vecs(vecs_file):
    f = open(vecs_file, mode='r')
    contents = f.readlines()
    n_rows, n_cols = contents[0].split()
    n_rows = int(n_rows)
    n_cols = int(n_cols)
    contents = contents[1:]
    contents_split = []
    for item in contents:
        split_item = item.strip('\n').split()
        current_list = [float(x) for x in split_item]
        contents_split.append(current_list)
    contents_split = sorted(contents_split, key=itemgetter(0))
    result_array = np.array([x[1:] for x in contents_split])
    return result_array

def load_json_dict(dict_file):
    d = json.load(open(dict_file, mode='r'))
    return {k: int(d[k]) for k in d}
    
def invert_dict(d):
    return {d[k]:k for k in d}