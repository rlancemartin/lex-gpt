import yt_dlp
import logging
import argparse
import requests
import pandas as pd
from youtubesearchpython import *

def get_episodes(channel_id,last_episode,logging):
     
    # Get playlist
    playlist = Playlist(playlist_from_channel_id(channel_id))
    while playlist.hasMoreVideos:
        print('Getting more videos...')
        playlist.getNextVideos()
        print(f'Videos Retrieved: {len(playlist.videos)}')

    # Store 
    stor_metadata=pd.DataFrame()
    for v in playlist.videos:
        try:
            ep_number = int(v['title'].split("|")[-1].split("#")[-1])
            stor_metadata.loc[v['title'],'number']=ep_number
            stor_metadata.loc[v['title'],'link']=v['link']
            stor_metadata.loc[v['title'],'title']=v['title']
            stor_metadata.loc[v['title'],'img']=v['thumbnails'][3]['url']
        except:
            logging.info("Metadata extraction failed on %s", v['title'])

    stor_metadata = stor_metadata[stor_metadata.number > last_episode]
    return stor_metadata

def dump_audio(stor_metadata,logging):
    # Iterate through episodes 
    for ix in stor_metadata.index:
        ep_number=int(stor_metadata.loc[ix,'number'])
        logging.info("Dumping audio for: %s"%ep_number)
        img_url=stor_metadata.loc[ix,'img']
        ep_link=stor_metadata.loc[ix,'link']
        # Write img 
        with open("../public/0%s.jpg"%str(ep_number), 'wb') as f:
            response = requests.get(img_url)
            f.write(response.content)
        # Write audio
        ydl_opts = {
        'format': 'm4a/bestaudio/best',
        'outtmpl': 'audio/%s.m4a'%str(ep_number),
        'noplaylist': True,
        'postprocessors': [{  
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'm4a',
        }]}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            error_code = ydl.download(ep_link)
    # Save 
    stor_metadata.reset_index().to_csv("audio_transcription/episodes.csv")

def get_last_episode():
    parser = argparse.ArgumentParser(description='Process last_episode')
    parser.add_argument('last_episode', type=int, help='the last episode number')
    args = parser.parse_args()
    return args.last_episode

def main():
    # Set up logger
    logging.basicConfig(filename='audio_dump.log',
                        filemode='w', 
                        level=logging.DEBUG)

    # Lex Fridman
    last_episode = get_last_episode()
    channel_id = "UCSHZKyawb77ixDdsGog4iWA" 
    stor_metadata = get_episodes(channel_id,last_episode,logging)
    dump_audio(stor_metadata,logging)

if __name__ == '__main__':
    main()
