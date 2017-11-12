import numpy as np

def cosine_sim(i,j,vecs):
    return np.dot(vecs[i,:], vecs[j,:])/(np.linalg.norm(vecs[i,:])*np.linalg.norm(vecs[j,:]))

def cycle_suspicion_desc(in_sim, out_sim, mean_sim, std_sim):
    suspicion_text = {(0,0):'Client\'s suspicious behaviour is with parties of relatively high financial proximity.',
                      (0,1):'Client has had suspicious incoming transactions from financially remote parties.',
                      (1,0):'Client has had suspicious outgoing transactions to financially remote parties.',
                      (1,1):'Client has had both incoming and outgoing transactions from and to financially remote parties.'}
    out_suspicion = 0
    in_suspicion = 0
    if (in_sim < mean_sim - std_sim):
        in_suspicion = 1
    if (out_sim < mean_sim - std_sim):
        out_suspicion = 1
    return suspicion_text[(out_suspicion, in_suspicion)]

def cycle_suspicion_score(in_sim, out_sim, mean_sim, std_sim):
    suspicion_score = 1 + max([0, mean_sim - std_sim - out_sim]) + max([0, mean_sim - std_sim - in_sim])
    return suspicion_score

def cycle_suspicion_for_agg(in_amount, out_amount, in_sim, out_sim, mean_sim, std_sim):
    mult = 1
    if in_amount > out_amount:
        mult = 0.8
    suspicion_score = 0.5 + 0.5/(1+np.exp(mult*(-max([0, mean_sim - std_sim - out_sim]) - max([0, mean_sim - std_sim - in_sim]))))
    return suspicion_score