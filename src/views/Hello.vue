<template>
  <el-container>
    <el-header>相由音生&nbsp;&nbsp;&nbsp;&nbsp; Voice-based Face Emotional Substitution System</el-header>
    <el-container>
      <el-aside width="300px">
        <button class="global--button-white"   v-if="imgDataUrl === ''" @click="toggleShow">upload</button>
        <img class="imageCon" v-else @click="toggleShow" :src="imgDataUrl" />
        <my-upload field="img"
          @crop-success="cropSuccess"
          @crop-upload-success="cropUploadSuccess"
          @crop-upload-fail="cropUploadFail"
          v-model="show"
          :width="256"
          :height="256"
          url=''
          :params="params"
          :headers="headers"
          :withCredentials="cred"
          img-format="jpg">
        </my-upload>
        <div class="logo">
          <img  :src="logo" />
          <div>HackxSJTU Group B21</div>
        </div>

      </el-aside>
      <el-main>
        <div class="dialogs">
          <div v-for="dialog in speechList" @click="changeAvatar(dialog.tag)">
            <el-card class="box-card">
              <div class="cardB">
                <div class="flex">
                  <div class="text">{{dialog.text}}</div>
                  <div class="item">
                    emotion: {{ dialog.tag }}
                  </div>
                </div>
                <div class="imgcont">
                  <img :src="emojiPack[dialog.tag]" alt="" />
                </div>
              </div>
            </el-card>
          </div>
        </div>
        <div class="bottom">
        <dictaphone @stop="handleRecording($event)">
          <template slot-scope="{ isRecording, startRecording, stopRecording, deleteRecording }">
            <button class="global--button-white" v-if="!isRecording" :disabled="imgDataUrl === ''" @click="startRecording">Start recording</button>
            <button class="global--button-white" v-else @click="stopRecording">Stop recording</button>
          </template>
        </dictaphone>
         
        <template v-if="audioSource">
          <audio :src="audioSource" controls></audio>
        </template>
        </div>
      </el-main>
    </el-container>
  </el-container>

</template>

<script>
import fetch from 'isomorphic-fetch'
import myUpload from 'vue-image-crop-upload'
import Dictaphone from '@/components/Dictaphone'

const logo1 = require('@/assets/images/logo.png');
const angryEm = require('@/assets/images/emoji/angry.png');
const fearfulEm = require('@/assets/images/emoji/fearful.png');
const happyEm = require('@/assets/images/emoji/happy.png');
const sadEm = require('@/assets/images/emoji/sad.png');
const originEm = require('@/assets/images/emoji/origin.png');

// const hostIP = 'http://localhost:3000';
// const token = '6zYp6HAEQUJfu3RKumxN1527905500092zDBG6BnDvx4KdBq9SYkv';
// const userId = '5b11fcdc4cbe2a48aae178ef';

const hostIP = 'http://202.120.1.152:3003';
const token = 'fX2Gbq8oPxOTGbhnTmzX1527989002910IoVwbt2dLlN4eDW4G1xk';
const userId = '5b13430a9aa1a43195d1ed8b';

const emojiPack = {
  angry: angryEm,
  fearful: fearfulEm,
  happy: happyEm,
  sad: sadEm,
  origin: originEm,
}

export default {
  name: 'hello',
  components: {
    'dictaphone': Dictaphone,
    'my-upload': myUpload,
  },
  data() {
    return {
      audioSource: null,
      audioblob: null,
      rec: null,
      recordingslist: [],
      show: false,
      cred: true,
      params: null,
      headers: null,
      imgDataUrl: '',
      mime: 'image/jpeg',
      speechList:[],
      logo: logo1,
      emojiPack,
    };
  },
  mounted() {
    this.getAvatar();
  },
  methods: {
    handleRecording({ blob, src }) {
      console.log(blob, src)
      this.audioblob = blob;
      this.audioSource = src;
      this.upload('audio')
    },
    toggleShow() {
      this.show = !this.show;
    },
    upload(type) {
      this.upthing = new FormData();
      if (type === 'audio') {
        this.upthing.append('file', this.audioblob, 'file.webm');
        (async () => {
          try {
            const res = await fetch(`${hostIP}/file`, {
              method: 'POST',
              body: this.upthing,
              headers: {
                Authorization: token,
              },
            });
            const resData = await res.json();
            if (res.ok) {
              this.$message('音频上传中，请稍后');
              const res2 = await fetch(`${hostIP}/speechToText?audio_name=${resData.result.filename}`, {
                method: 'GET',
                headers: {
                  Authorization: token,
                },
              });
              const resData2 = await res2.json();
              if (res2.ok) {
                this.$message('音频上传成功');
                const text = resData2.result;
                const res3 = await fetch(`${hostIP}/analizeText?text=${text}`, {
                  method: 'GET',
                  headers: {
                    Authorization: token,
                  },
                });
                const resData3 = await res3.json();
                if (res3.ok) {
                  const tag = resData3.result;
                  this.speechList.push({text, tag});
                  this.imgDataUrl = this.avatarObj[tag];
                  this.$nextTick()
                }
                else {
                  this.speechList.append({text:'Do not know', tag:'origin'});
                }
              }
            }
          } catch (err) {
            console.log(err)
          }
        })()
      } else {
        this.upthing.append('file', this.data2blob(this.imgDataUrl, this.mime), 'file.jpg');
        (async () => {
          try {
            const res = await fetch(`${hostIP}/avatarFile?userId=${userId}`, {
              method: 'POST',
              body: this.upthing,
              headers: {
                Authorization: token,
              },
            });
            this.$message('头像上传中，请稍等...');
            const resData = await res.json();
            if (res.ok) {
              const res2 = await fetch(`${hostIP}/generateAvatars?avatarName=${resData.result.filename}&mock=false`, {
                method: 'POST',
                headers: {
                  Authorization: token,
                },
              });
              const resData2 = await res2.json();
              if (res2.ok) {
                this.$message('头像上传完毕');
                this.avatarObj = resData2.result;
                localStorage.avatarObject = this.avatarObj;
              }
            }
          } catch (err) {
            console.log(err)
          }
        })()
      }
    },
    /**
     * crop success
     *
     * [param] imgDataUrl
     * [param] field
     */
    data2blob(data, mime) {
      const data0 = data.split(',')[1];
      const data00 = window.atob(data0);
      const ia = new Uint8Array(data00.length);
      for (let i = 0; i < data00.length; i += 1) {
        ia[i] = data00.charCodeAt(i);
      }
      // canvas.toDataURL 返回的默认格式就是 image/png
      return new Blob([ia], {
        type: mime,
      });
    },
    getAvatar() {
      (async () => {
        try {
          const res = await fetch(`${hostIP}/avatars`, {
            method: 'GET',
            headers: {
              Authorization: token,
            },
          });
          const resData2 = await res.json();
          if (res.ok) {
            this.avatarObj = resData2.result;
            localStorage.avatarObject = this.avatarObj;
            this.imgDataUrl = this.avatarObj['origin'];
          }
        } catch (err) {
          console.log(err)
        }
      })()
    },
    cropSuccess(imgDataUrl, field) {
      console.log('-------- crop success --------');
      this.imgDataUrl = imgDataUrl;
      console.log(field)
      this.upload('pic')
      this.toggleShow();
    },
    /**
     * upload success
     *
     * [param] jsonData   服务器返回数据，已进行json转码
     * [param] field
     */
    cropUploadSuccess(jsonData, field) {
      console.log('-------- upload success --------');
      console.log(jsonData);
      console.log(field);
    },
    /**
     * upload fail
     *
     * [param] status    server api return error status, like 500
     * [param] field
     */
    cropUploadFail(status, field) {
      console.log('-------- upload fail --------');
      console.log(status);
      console.log(field);
    },
    changeAvatar(tag) {
      this.imgDataUrl = this.avatarObj[tag];
      this.$nextTick();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
@import "~@/styles/colors.less";
  .imageCon {
    width: 80%;
    background: #FFF;
    box-shadow: 2px 5px 3px #888888;
    margin-top: 50px;
    border-radius: 5px;
  }
  .el-header, .el-footer {
    background-color: #232F34;
    color: rgb(245, 245, 245);
    text-align: center;
    line-height: 60px;
    font-size: 22px;
    font-weight: 500;
    height: 20vh;
  }
  
  .el-aside {
    background-color: rgb(250, 171, 52);
    color: #333;
    text-align: center;
    line-height: 200px;
  }
  
  .el-main {
    background-color: rgb(245, 245, 245);
    color: #333;
    text-align: center;
    line-height: 160px;
    height: 95vh;
  }
  
  body > .el-container {
    margin-bottom: 40px;
  }
  
  .el-container:nth-child(5) .el-aside,
  .el-container:nth-child(6) .el-aside {
    line-height: 260px;
  }
  
  .el-container:nth-child(7) .el-aside {
    line-height: 320px;
  }
  .item {
    height: 30px;
  }
  .el-card {
    margin: 50px 0 25px 0;
    height: 100px;
    line-height: 30px;
    cursor: pointer;
  }
  .bottom {
    height: 20vh;
    width: 800px;
    top: 80vh;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .dialogs {
    height: 700px;
    overflow: scroll;
  }
  .text {
    text-align: left;
    font-weight: 600;
    font-size: 27px;
  }
  .item {
    text-align: left !important;
    color: #f9aa33;
    font-size: 20px;
    font-weight: 500;
  }
  .logo {
    width: 150px;
    position: absolute;
    top: 750px;
    left: 71px;
    line-height: 20px;
    img {
      width: 150px;
    }
  }
  .cardB {
    display: flex !important;
    justify-content: space-between;
    .imgcont {
      img {
        height: 50px;
      }
    }
  }
  .sad {
    
  }
  .happy {

  }
  .scared {

  }
  .angry {

  }
</style>
