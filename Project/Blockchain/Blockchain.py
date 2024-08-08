import pandas as pd
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')
from scipy.stats import percentileofscore
import os
import base64
from io import BytesIO
from CodeWeb_Python.api import StrategyModule as strategy

@strategy.register(name="Load_Data", comment="Load data from CSV files")
def Load_Data(file_path):
    # LOAD DATACreate dataframes from CSV files
    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir, file_path)
    files_list = None
    for (root,dirs,files) in os.walk(
        file_path, topdown=True):
        files_list=files
        root_dir=root
    file_path_list=[root_dir+'/'+file for file in files_list]
    file_path_list.sort()

    miner_summaries=[pd.read_csv(file_path).drop(columns='Unnamed: 0') for file_path in file_path_list] #Load each summary (slice) in list

    for df in miner_summaries: # Edit miners with null blocks
        df.loc[df['block'].isnull(),'block']=1
    # Final list with miner summary dataframes
    # print(miner_summaries[5].head()[1])
    return miner_summaries

@strategy.register(name="ME_1", comment="Plot miner evolution with miners and transactions")
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