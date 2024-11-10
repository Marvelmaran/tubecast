import express from "express";
import * as tube from "youtube-search-without-api-key";
import ytdl from "ytdl-core";

const uniqObject = (arr) => {
  return arr.filter((item, index) => {
    return arr.findIndex((obj) => obj.id === item.id) === index;
  });
};

export function convertToProperStructure(obj) {
  const convertedObj = obj.map((item) => {
    const obj = {
      id: item.id.videoId,
      title: item.title,
      thumbnail: item.snippet.thumbnails.default.url,
      video: item.url,
      duration: item.snippet.duration,
      publishedAt: item.snippet.publishedAt,
      views: item.views,
    };
    return obj;
  });
  const uniqConvertedObj = uniqObject(convertedObj);

  return uniqConvertedObj;
}

export async function getChannelDetails(channelId) {
  const result = { success: false, objects: [], error: "" };
  try {
    const channelDetails = await tube.search(channelId);
    const channelDetailsNew = await tube.search(channelId + " hr ago");
    const convertedChannelDetails = convertToProperStructure(
      channelDetails.concat(channelDetailsNew)
    );
    result.success = true;
    result.objects = convertedChannelDetails;
  } catch (error) {
    console.log(error);

    result.error = "Something wrong happened";
  }
  return result;
}

const router = express.Router();

router.get("/videos", async (req, res) => {
  const query = req.query;
  const search = query.search;
  if (!search) return res.status(400).send("Search is required");

  const result = await getChannelDetails(search);
  res.status(result.success ? 200 : 400).send(result);
});

const getAudioOFVideo = async (videoID) => {
  const result = { success: false, objects: [], error: "" };
  try {
    let info = await ytdl.getInfo(videoID);
    let audioFormats = ytdl.filterFormats(info.formats, "audioonly");
    result.success = true;
    result.objects = audioFormats.map((audio) => ({
      url: audio.url,
      quality: audio.quality,
      container: audio.container,
    }));
  } catch (error) {
    console.log(error);
    result.error = "Something wrong happened";
  }
  return result;
};

router.get("/audio/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) res.status(400).send("Id is required");
  const result = await getAudioOFVideo(id);
  res.status(result.success ? 200 : 400).send(result);
});

export default router;
