<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showToast, showSuccessToast, showLoadingToast, closeToast } from 'vant'
import { getManagerPrizes, createPrize, updatePrize, uploadPrizeImage } from '@/api/prizes'
import type { Prize } from '@/api/prizes'

const prizeList = ref<Prize[]>([])
const showForm = ref(false)
const editingId = ref<string | null>(null)
const formLoading = ref(false)

const form = ref({
  name: '',
  points_required: '',
  stock: '',
  is_blind_box: false,
  image_key: '' as string,
  image_url: '' as string,
})

function resetForm() {
  form.value = { name: '', points_required: '', stock: '', is_blind_box: false, image_key: '', image_url: '' }
  editingId.value = null
}

async function loadPrizes() {
  try {
    const { data } = await getManagerPrizes()
    prizeList.value = data.data
  } catch {
    showToast('加载失败')
  }
}

function openCreate() {
  resetForm()
  showForm.value = true
}

function openEdit(prize: Prize) {
  editingId.value = prize.id
  form.value = {
    name: prize.name,
    points_required: String(prize.points_required),
    stock: String(prize.stock),
    is_blind_box: prize.is_blind_box === 1,
    image_key: prize.image_key || '',
    image_url: prize.image_url || '',
  }
  showForm.value = true
}

// 选择图片后立即上传
async function onImageSelect(item: any) {
  const file = Array.isArray(item) ? item[0]?.file : item?.file
  if (!file) return
  showLoadingToast({ message: '上传中...', forbidClick: true, duration: 0 })
  try {
    const { data } = await uploadPrizeImage(file)
    form.value.image_key = data.data.image_key
    form.value.image_url = data.data.image_url
    closeToast()
    showSuccessToast('上传成功')
  } catch (err: any) {
    closeToast()
    showToast(err.response?.data?.error || '上传失败')
  }
}

async function onSubmit() {
  if (!form.value.name || !form.value.points_required || !form.value.stock) {
    showToast('请填写完整信息')
    return
  }

  formLoading.value = true
  try {
    const fd = new FormData()
    fd.append('name', form.value.name)
    fd.append('points_required', form.value.points_required)
    fd.append('stock', form.value.stock)
    fd.append('is_blind_box', form.value.is_blind_box ? '1' : '0')
    if (form.value.image_key) fd.append('image_key', form.value.image_key)

    if (editingId.value) {
      await updatePrize(editingId.value, fd)
    } else {
      await createPrize(fd)
    }

    showSuccessToast(editingId.value ? '更新成功' : '创建成功')
    showForm.value = false
    await loadPrizes()
  } catch (err: any) {
    showToast(err.response?.data?.error || '操作失败')
  } finally {
    formLoading.value = false
  }
}

onMounted(loadPrizes)
</script>

<template>
  <div class="prizes-page">
    <van-nav-bar title="奖品管理" :border="false">
      <template #right>
        <van-icon name="plus" size="20" color="#fff" @click="openCreate" />
      </template>
    </van-nav-bar>

    <div class="prize-list">
      <van-cell-group inset v-if="prizeList.length > 0">
        <van-cell
          v-for="prize in prizeList"
          :key="prize.id"
          :title="prize.name"
          :label="`${prize.points_required}积分 | 库存: ${prize.stock}`"
          is-link
          @click="openEdit(prize)"
        >
          <template #icon>
            <van-image
              width="48px"
              height="48px"
              radius="8"
              fit="cover"
              :src="prize.image_url || '/logo.png'"
              style="margin-right: 12px;"
            />
          </template>
          <template #value>
            <van-tag v-if="prize.is_blind_box" type="warning" plain>盲盒</van-tag>
            <van-tag v-if="!prize.is_active" type="danger" plain>已下架</van-tag>
          </template>
        </van-cell>
      </van-cell-group>
      <van-empty v-else description="暂无奖品，点击右上角添加" />
    </div>

    <!-- 创建/编辑弹窗 -->
    <van-popup v-model:show="showForm" position="bottom" round :style="{ maxHeight: '85%' }">
      <div class="form-popup">
        <van-nav-bar
          :title="editingId ? '编辑奖品' : '新建奖品'"
          left-text="取消"
          right-text="保存"
          @click-left="showForm = false"
          @click-right="onSubmit"
        />
        <van-form>
          <van-cell-group>
            <van-field v-model="form.name" label="奖品名称" placeholder="必填" required />
            <van-field v-model="form.points_required" type="digit" label="所需积分" placeholder="必填" required />
            <van-field v-model="form.stock" type="digit" label="库存数量" placeholder="必填" required />
            <van-cell title="随机盲盒">
              <template #right-icon>
                <van-switch v-model="form.is_blind_box" size="20" />
              </template>
            </van-cell>
            <van-field label="奖品图片">
              <template #input>
                <div class="image-upload-area">
                  <van-image
                    v-if="form.image_url"
                    width="80px"
                    height="80px"
                    radius="8"
                    fit="cover"
                    :src="form.image_url"
                    style="margin-right: 8px;"
                  />
                  <van-uploader :after-read="onImageSelect" :max-count="1" :preview-image="false" />
                </div>
              </template>
            </van-field>
          </van-cell-group>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.prizes-page {
  background: var(--van-background);
  min-height: 100%;
}

:deep(.van-nav-bar) {
  background: var(--keep-green);
}

:deep(.van-nav-bar__title) {
  color: #fff;
}

.prize-list {
  padding: 16px 0;
}

.form-popup {
  padding-bottom: env(safe-area-inset-bottom);
}

.form-popup :deep(.van-nav-bar) {
  background: #fff;
}

.form-popup :deep(.van-nav-bar__title) {
  color: var(--van-text-color);
}

.image-upload-area {
  display: flex;
  align-items: center;
}
</style>
