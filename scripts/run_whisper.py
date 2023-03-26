# trascribe audio 
import time,os
import logging
import whisper 
import numpy as np
import pandas as pd

# Set up logger
logging.basicConfig(filename='whisper.log', filemode='w', level=logging.DEBUG)

# Read the csv file
new_ep=pd.read_csv("audio_transcription/episodes.csv",index_col=None)

# Run whisper on each audio file
for ix in new_ep.index:

    # get data 
    ep_number=int(new_ep.loc[ix,'number'])
    print("EPISODE: %s"%ep_number)
    logging.info("EPISODE: %s", ep_number)

    # get audio 
    audio_file_path='audio/%s.m4a'%str(ep_number)
    out_file_path='audio_transcription/"0"+%s.txt'%str(ep_number)

    print(f"Processing file: {audio_file_path}")
    logging.info(f"Processing file: {audio_file_path}")
    start_time = time.time()

    # load Whisper model and transcribe audio file
    model = whisper.load_model("medium")
    result = model.transcribe(audio_file_path)
    
    # write
    with open(out_file_path, "w") as f:
        for seg in result['segments']:
            ts = np.round(seg['start'],1)
            f.write(new_ep.loc[ix,'link'] + "&t=%ss"%ts + "\t" + str(ts) + "\t" + seg['text'] + "\n")

    end_time = time.time()
    time_diff = end_time - start_time
    print(f"Time taken: {time_diff:.2f} seconds")
    logging.info(f"File processed: {audio_file_path}")
    logging.info(f"Time taken: {time_diff:.2f} seconds")