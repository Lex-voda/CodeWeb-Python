import networkx as nx
from scipy.stats import percentileofscore
import numpy as np
import random


def draw_2node_graph(fig,G,nodes_1,nodes_2,edges,edge_width_v,subplot_q,edge_type='',max_sample=1000):

    # Sample a max of 5000 edges to reduce plotting time and increase visibility
    init_edges=len(edges)
    if init_edges>max_sample:
        edges=random.sample(list(edges), max_sample)
    trimmed_edges=len(edges)


    # Define circular layout 
    pos_o=nx.spring_layout(nodes_1, scale=1,center=(-4,0))
    pos_n=nx.spring_layout(nodes_2, scale=0.9,center=(4,0))
    total_pos=pos_o
    total_pos.update(pos_n)


    # Define transactions to show (incoming edges)

    values=np.array([d[edge_width_v] for _,_,d in edges])
    max_value=np.max(values)
    values=values/max_value
    values_per=np.array([percentileofscore(values,v,'rank') for v in values])/100

    
    # Draw nodes and edges
    ax=fig.add_subplot(subplot_q)
    ax.title.set_text('Transaction Graph')
    nx.draw_networkx_nodes(G, total_pos, nodelist=nodes_1, node_size=1, node_color='blue', alpha=0.3)
    nx.draw_networkx_nodes(G, total_pos, nodelist=nodes_2, node_size=2, node_color='red', alpha=0.5)
    nx.draw_networkx_edges(G,total_pos,edgelist=edges,alpha=0.1,width=values_per)
    
    return fig,trimmed_edges