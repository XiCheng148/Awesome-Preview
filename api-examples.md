---
title: 演示
---

# 链接预览神器演示

<script setup>
import { ref } from 'vue'

const isPreviewOpen = ref(false)
const togglePreview = () => isPreviewOpen.value = !isPreviewOpen.value
</script>

## 交互式演示

按住Shift键并点击下方链接来体验预览功能：

<div class="preview-demo">
  <a href="#" @mousedown="e => e.shiftKey && togglePreview()">示例链接</a>
  <div v-if="isPreviewOpen" class="preview-window">
    <h3>预览内容</h3>
    <p>这是链接预览的内容示例。在实际使用中，这里会显示目标页面的摘要信息。</p>
    <div class="preview-actions">
      <button @click="togglePreview">关闭</button>
      <button>在新标签页打开</button>
    </div>
  </div>
</div>

<style>
.preview-demo {
  position: relative;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.preview-window {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-width: 400px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.preview-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.preview-actions button {
  margin-left: 10px;
}
</style>

## 视频演示

<iframe width="560" height="315" src="https://www.youtube.com/embed/YOUR_VIDEO_ID" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
