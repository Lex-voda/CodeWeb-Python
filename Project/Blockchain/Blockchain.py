import pandas as pd
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
from scipy.stats import percentileofscore
import os
import base64
from io import BytesIO

from utils import draw_2node_graph

from CodeWeb_Python.api import StrategyModule as strategy

@strategy.register(name="Load_Data", comment="Load data from CSV files")
def Load_Data(file_path):
    # LOAD DATACreate dataframes from CSV files
    for (root,dirs,files) in os.walk(
        './data/miner_volume', topdown=True):
        files_list=files
        root_dir=root
    file_path_list=[root_dir+'/'+file for file in files_list]
    file_path_list.sort()

    miner_summaries=[pd.read_csv(file_path).drop(columns='Unnamed: 0') for file_path in file_path_list] #Load each summary (slice) in list

    for df in miner_summaries: # Edit miners with null blocks
        df.loc[df['block'].isnull(),'block']=1
    # Final list with miner summary dataframes
    print(miner_summaries[5].head())
    return miner_summaries

@strategy.register(name="ME_miners_and_transactions", comment="Plot miner evolution with miners and transactions")
def Miner_Evolution_1(miner_summaries):
    # Create series with number of miners and transactions
    no_miners=[len(miner_summary) for miner_summary in miner_summaries]
    no_transactions=[miner_summary['transaction_count'].sum() for miner_summary in miner_summaries]

    # Plot
    y_pos = np.arange(len(no_miners))
    fig,ax=plt.subplots(figsize=(10,10))

    ax1 = ax.twinx()
    fig.suptitle('Miner evolution: miners and transactions',fontsize=20)

    ax.bar(y_pos,no_miners)
    ax1.plot(no_transactions,color='r')

    ax.set_xlabel('Period',fontsize=16)
    ax.set_ylabel('Number of miners', color='b',fontsize=16)
    ax1.set_ylabel('Transactions mined', color='r',fontsize=16)
    
    buf = BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    return 'data:image/png;base64,'+img_base64

@strategy.register(name="ME_miners_and_blocks", comment="Plot miner evolution with miners and blocks")
def Miner_Evolution_2(miner_summaries):
    # Create series with number of miners and transactions
    no_miners=[len(miner_summary) for miner_summary in miner_summaries]
    no_transactions=[miner_summary['block'].sum() for miner_summary in miner_summaries]

    # Plot
    y_pos = np.arange(len(no_miners))
    fig,ax=plt.subplots(figsize=(10,10))

    ax1 = ax.twinx()
    fig.suptitle('Miner evolution: miners and blocks',fontsize=20)

    ax.bar(y_pos,no_miners)
    ax1.plot(no_transactions,color='r')

    ax.set_xlabel('Period',fontsize=16)
    ax.set_ylabel('Number of miners', color='b',fontsize=16)
    ax1.set_ylabel('Number of blocks mined', color='r',fontsize=16)
    
    buf = BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    return 'data:image/png;base64,'+img_base64

@strategy.register(name="ME_miners_and_rewards", comment="Plot miner evolution with miners and rewards")
def Miner_Evolution_3(miner_summaries):
    # Extract addresses for top 10 miners

    top10_miners=miner_summaries[-1].iloc[:10,:]['miner'] # Addresses for top 10 miners

    # Create a list of lists for each miner to track their mining share across periods 

    top10_per_list=[] 
    for miner in top10_miners:
        miner_per_list=[]
        for summary in miner_summaries:
            try: 
                blocks_mined=summary.loc[summary['miner']==miner]['block'].values[0]
            except IndexError: # Catch error if miner has not appeared in slice
                blocks_mined=0 

            miner_share=blocks_mined/summary['block'].sum()
            miner_per_list.append(miner_share)
        top10_per_list.append(miner_per_list)

    # Stack Plot
    fig,ax=plt.subplots(figsize=(10,10))
    fig.suptitle('% of total Blocks mined by miners that are currently in top 10',fontsize=20)

    x=np.arange(len(miner_summaries))
    ax.stackplot(x, *top10_per_list)

    ax.set_xlabel('Period',fontsize=16)
    ax.set_ylabel('% Share of blocks mined',fontsize=16)
    ax.set_ylim(0,1)
    
    buf = BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    return 'data:image/png;base64,'+img_base64

@strategy.register(name="NetworkX_Graph", comment="Generate NetworkX graph")
def NetworkX_Graph():
    # Load the final snapshot of edges
    miners=pd.read_csv('./data/miners_summary.csv')
    miners['miner_id']=miners.index
    miners_transactions=np.load('./data/miners_trans_evolution_usd.npy',allow_pickle=True)[-1]

    # Add miner id and change index
    miners['miner_id']=miners.index #Use index of sorted dataframe (ranking) as miner_id
    miners=miners.rename(columns={"count": "no. blocks", "sum": "no. transactions","nunique": "unique tags",'max':'miner_tag'})

    # Additional transformations for edge calculations
    miners.set_index('miner',inplace=True) #Set address as index
    miners['miner']=miners.index
    print(miners.head())
    
    nodes=list(miners['miner_id'])
    # Transform concatenation into tuple of miner ids
    # Extract array
    address_ex=miners_transactions[:,0] 
    address_ex=address_ex.astype(np.str)

    # Split strings into two separate lists: join_list_0 and join_list_1
    split_ad=np.char.rpartition(address_ex,'0x')
    split_ad_m=np.split(split_ad,[1,2],axis=1) 
    join=np.core.defchararray.add(split_ad_m[1],split_ad_m[2])
    join_0=np.squeeze(split_ad_m[0])
    join_list_0=[miners.miner_id[address] for address in join_0]
    join=np.squeeze(join)
    join_list_1=[miners.miner_id[address] for address in join ]

    # Create array of unique edges and edge_weights (undirected graph) to feed to Graph definition 
    tuples=zip(join_list_0,join_list_1)
    tuples_list=[(a,b) for a,b in tuples]
    edges=[(e[0],e[1],{'value':v}) for e,v in zip(tuples_list,miners_transactions[:,1])]
    
    # Define Graph from a NetworkX graph object
    G=nx.DiGraph()
    G.add_nodes_from(nodes)
    G.add_edges_from(edges)
    
    fig=plt.figure(figsize=(18,18))

    # Define lists for top 10 miners 'nodes_1' and the rest 'nodes_2'. Remember that the DataFrame them 
    # in order of mining power. 
    nodes_1=miners['miner_id'][:10].tolist()
    nodes_2=miners['miner_id'][10:].tolist()

    fig,trimmed_edges = draw_2node_graph(fig,G,nodes_1,nodes_2,G.edges(data=True),'value',111,edge_type='',max_sample=2000)
    
    buf = BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    return 'data:image/png;base64,'+img_base64
