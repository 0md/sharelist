/*
 * video/audio/image 在线预览插件
 */
const name = 'mediaParse'

const version = '1.1'

module.exports = ({getSource , getPluginOption , setPluginOption}) => {

  const preview = {};
  let videoFormatKey = 'video_previewable_formats'
  let videoPlayerKey = 'video_previewable_player'

  let videoFormatOption = getPluginOption(videoFormatKey) || {};
  let videoPlayerOption = getPluginOption(videoPlayerKey) || {};
  let videoFormat = 'mp4,ogg,webm,mpeg,m4v'
  let videoPlayer = 'default'

  if( videoFormatOption.value ){
    videoFormat = videoFormatOption.value
    videoPlayer = videoPlayerOption.value
  }else{
    setPluginOption(videoFormatKey,{value:videoFormat , label:'支持预览的视频后缀','placeholder':'文件扩展名，多个用逗号分隔'})
  }

  if( videoPlayerOption.value ){
    videoPlayer = videoPlayerOption.value
  }else{
    setPluginOption(videoPlayerKey,{value:videoPlayer , label:'视频预览播放器',options:[{'label':'默认','value':'default'},{'label':'DPlayer','value':'dplayer'}]})
  }

  const decodeUrl = (req) => {
    return req.path + ( req.querystring ? '?' + req.querystring.replace(/preview&?/,'') : '')
  }

  const video = async (data , req) => {
    let videoPlayer = (getPluginOption(videoPlayerKey) || {value:'default'}).value;

    return {
      ...data,
      // body:`
      //   <video src="${req.path}" style="min-width: 90%;min-height: 60vh;" controls="controls" autoplay="autoplay"></video>
      // `,
       body: videoPlayer == 'dplayer' ? `
        <script src="https://cdn.bootcss.com/dplayer/1.25.0/DPlayer.min.js"></script>
        <link href="https://cdn.bootcss.com/dplayer/1.25.0/DPlayer.min.css" rel="stylesheet" />
        <div id="dplayer" style="margin-top:32px;height:60vh;">
        <script>
          var dp = new DPlayer({
            container: document.getElementById('dplayer'),
            video: {
                url: '${decodeUrl(req)}',
            },
          });
        </script>
      ` : `
        <iframe></iframe><script>var content='<style>video{width:100%;height:100%;background:#000;}body{margin:0;padding:0;}</style><video src="${decodeUrl(req)}" controls="controls" autoplay="autoplay"></video>';document.querySelector("iframe").contentWindow.document.write(content);</script>
      `
    }
  }

  const audio = async (data , req) => {
    return {
      ...data,
      body:`
        <iframe></iframe><script>document.querySelector("iframe").contentWindow.document.write('<audio src="${decodeUrl(req)}" controls="controls" autoplay="autoplay" />')</script>
      `
    }
  }

  const image = async (data , req) => {
    return {
      ...data,
      body:`
        <img src="${decodeUrl(req)}" />
      `
    }
  }


  videoFormat.split(',').forEach( ext => {
    preview[ext] = video
  });

  ['mp3','m4a','acc'].forEach( ext => {
    preview[ext] = audio
  });

  ['jpg','jpeg','png','gif','bmp'].forEach( ext => {
    preview[ext] = image
  });

  return { name , version , preview }
}