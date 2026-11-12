import axios from 'axios';
import sharp from 'sharp';
import NodeID3 from 'node-id3';

/**
 * Downloads thumbnail and embeds ID3v2 tags into an MP3 file
 * @param {string} mp3FilePath - Path to the converted MP3 file
 * @param {object} metadata - Metadata object { title, artist, year, thumbnailUrl, videoId }
 */
export async function embedMp3Metadata(mp3FilePath, metadata) {
  try {
    let imageBuffer = null;

    // 1. Determine best candidate thumbnail URLs
    const candidateUrls = [];
    if (metadata.videoId) {
      candidateUrls.push(
        `https://i.ytimg.com/vi/${metadata.videoId}/maxresdefault.jpg`,
        `https://i.ytimg.com/vi/${metadata.videoId}/sddefault.jpg`,
        `https://i.ytimg.com/vi/${metadata.videoId}/hqdefault.jpg`
      );
    }
    if (metadata.thumbnailUrl) {
      candidateUrls.push(metadata.thumbnailUrl);
    }

    // Try fetching each thumbnail candidate
    for (const url of candidateUrls) {
      try {
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 8000
        });
        if (response.status === 200 && response.data && response.data.length > 1000) {
          imageBuffer = Buffer.from(response.data);
          break;
        }
      } catch {
        // Try next candidate
      }
    }

    let squareCoverBuffer = null;
    if (imageBuffer) {
      // 2. Crop to square (1:1) with high quality Lanczos3 for standard music players
      try {
        squareCoverBuffer = await sharp(imageBuffer)
          .resize(800, 800, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 92 })
          .toBuffer();
      } catch (sharpErr) {
        console.warn('[Tagger] Sharp resizing error, falling back to raw image:', sharpErr.message);
        squareCoverBuffer = imageBuffer;
      }
    }

    // 3. Build ID3v2 tags
    const tags = {
      title: metadata.title || 'Unknown Title',
      artist: metadata.artist || 'Unknown Artist',
      album: metadata.album || metadata.artist || 'RanTube Music',
      year: metadata.year ? String(metadata.year) : undefined,
      comment: {
        language: 'eng',
        text: 'Downloaded with RanTube Converter'
      }
    };

    if (squareCoverBuffer) {
      tags.image = {
        mime: 'image/jpeg',
        type: {
          id: 3,
          name: 'front cover'
        },
        description: 'Cover Art',
        imageBuffer: squareCoverBuffer
      };
    }

    // 4. Write tags using node-id3
    const success = NodeID3.write(tags, mp3FilePath);
    if (!success) {
      console.warn('[Tagger] NodeID3.write returned false for', mp3FilePath);
    } else {
      console.log(`[Tagger] Successfully tagged MP3 with cover art (${squareCoverBuffer ? squareCoverBuffer.length : 0} bytes)`);
    }

    return success;
  } catch (error) {
    console.error('[Tagger] Failed to embed metadata:', error.message);
    return false;
  }
}

