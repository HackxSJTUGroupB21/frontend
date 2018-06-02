<template>
  <el-container>
    <el-header>相由音生</el-header>
    <el-container>
      <el-aside width="300px">
        <button class="global--button-white"   v-if="imgDataUrl === ''" @click="toggleShow">upload</button>
        <img class="imageCon" v-else @click="toggleShow" :src="imgDataUrl" />
        <my-upload field="img"
          @crop-success="cropSuccess"
          @crop-upload-success="cropUploadSuccess"
          @crop-upload-fail="cropUploadFail"
          v-model="show"
          :width="300"
          :height="300"
          url=''
          :params="params"
          :headers="headers"
          :withCredentials="cred"
          img-format="png">
        </my-upload>
      </el-aside>
      <el-main>
        <div v-for="dialog in dialogs">
          <el-card class="box-card">
            <div>hhhh</div>
            <div v-for="o in 4" class="item">
              {{'列表内容 ' + o }}
            </div>
          </el-card>
        </div>
        <dictaphone @stop="handleRecording($event)">
          <template slot-scope="{ isRecording, startRecording, stopRecording, deleteRecording }">
            <button class="global--button-white" v-if="!isRecording" @click="startRecording">Start recording</button>
            <button class="global--button-white" v-else @click="stopRecording">Stop recording</button>
          </template>
        </dictaphone>
         
        <template v-if="audioSource">
          <audio :src="audioSource" controls></audio>
        </template>
      </el-main>
    </el-container>
  </el-container>

</template>

<script>
// import Recorder from 'opus-recorder'
import fetch from 'isomorphic-fetch'
import myUpload from 'vue-image-crop-upload'
import Dictaphone from '@/components/Dictaphone'
// import request from '@/utils/request'

export default {
  name: 'hello',
  components: {
    'dictaphone': Dictaphone,
    'my-upload': myUpload,
  },
  data() {
    return {
      dialogs: [0, 1, 2, 3],
      audioSource: null,
      audioblob: null,
      rec: null,
      recordingslist: [],
      show: true,
      cred: true,
      params: null,
      headers: null,
      imgDataUrl: '',
      mime: 'image/jpeg',
      speechList:[],
    };
  },
  mounted() {

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
            const res = await fetch('http://localhost:3000/file', {
              method: 'POST',
              body: this.upthing,
              headers: {
                Authorization: '6zYp6HAEQUJfu3RKumxN1527905500092zDBG6BnDvx4KdBq9SYkv',
              },
            });
            const resData = await res.json();
            if (res.ok) {
              alert('音频上传成功')
              const res2 = await fetch(`http://localhost:3000/speechToText?audio_name=${resData.result.filename}`, {
                method: 'GET',
                headers: {
                  Authorization: '6zYp6HAEQUJfu3RKumxN1527905500092zDBG6BnDvx4KdBq9SYkv',
                },
              });
              const resData2 = res2.json();
              if (res2.ok) {
                console.log(resData2)
                const text = resData2.result;
                const res3 = await fetch(`http://localhost:3000/speechToText?audio_name=${resData.result.filename}`, {
                  method: 'GET',
                  headers: {
                    Authorization: '6zYp6HAEQUJfu3RKumxN1527905500092zDBG6BnDvx4KdBq9SYkv',
                  },
                });
                const resData3 = await res3.json();
                if (res3.ok) {
                  const tag = resData3.result;
                  this.speechList.append({text, tag});
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
            const res = await fetch('http://localhost:3000/avatarFile', {
              method: 'POST',
              body: this.upthing,
              headers: {
                Authorization: '6zYp6HAEQUJfu3RKumxN1527905500092zDBG6BnDvx4KdBq9SYkv',
              },
            });
            const resData = await res.json();
            if (res.ok) {
              console.log(resData)
              const res2 = await fetch(`http://localhost:3000/generateAvatars?avatarName=${resData.result.filename}`, {
                method: 'POST',
                headers: {
                  Authorization: '6zYp6HAEQUJfu3RKumxN1527905500092zDBG6BnDvx4KdBq9SYkv',
                },
              });
              const resData2 = await res2.json();
              if (res2.ok) {
                console.log(resData2)
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
          const res = await fetch('http://localhost:3000/avatars', {
            method: 'GET',
            headers: {
              Authorization: '6zYp6HAEQUJfu3RKumxN1527905500092zDBG6BnDvx4KdBq9SYkv',
            },
          });
          const resData2 = res.json();
          if (res.ok) {
            this.avatarObj = resData2.result;
            localStorage.avatarObject = this.avatarObj;
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
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
@import "~@/styles/colors.less";
  .imageCon {
    width: 100%;
  }
  .el-header, .el-footer {
    background-color: #66CCFF;
    color: #333;
    text-align: center;
    line-height: 60px;
    height: 10vh;
  }
  
  .el-aside {
    background-color: #CCFFFF;
    color: #333;
    text-align: center;
    line-height: 200px;
  }
  
  .el-main {
    background-color: #FFFFFF;
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
    margin-bottom: 50px;
    height: 100px;
    line-height: 30px;
  }
  .item {
    display: inline;
  }
</style>
