<template>
  <div class="page-container">
    <van-nav-bar title="奖品管理" left-arrow @click-left="$router.back()" />
    <div class="content">
      <van-empty v-if="!prizes.length" description="暂无奖品，点击下方按钮添加" />
      <van-cell-group v-else inset>
        <van-cell v-for="item in prizes" :key="item.id" :title="item.name" :label="`库存 ${item.remainingStock}/${item.totalStock} · ${item.requiredPoints} 积分`">
          <template #value>
            <van-tag :type="item.archived ? 'default' : 'success'" style="margin-right: 8px">
              {{ item.archived ? '已下架' : '上架中' }}
            </van-tag>
            <van-button
              v-if="!item.archived"
              size="mini"
              type="danger"
              plain
              @click="handleArchive(item.id)"
            >
              下架
            </van-button>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
    <div class="fab">
      <van-button round type="primary" icon="plus" @click="showCreate = true">新增奖品</van-button>
    </div>

    <van-popup v-model:show="showCreate" position="bottom" round>
      <div class="create-form">
        <h3>新增奖品</h3>
        <van-field v-model="form.name" label="名称" placeholder="请输入奖品名称" />
        <van-field v-model.number="form.requiredPoints" label="所需积分" type="number" placeholder="请输入积分" />
        <van-field v-model.number="form.totalStock" label="库存" type="number" placeholder="请输入库存" />
        <div class="create-actions">
          <van-button plain @click="showCreate = false">取消</van-button>
          <van-button type="primary" :loading="creating" @click="handleCreate">保存</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { showConfirmDialog, showSuccessToast } from 'vant'
import { archivePrize, createPrize, getManagerPrizes } from '@/api/prize'

const prizes = ref([])
const showCreate = ref(false)
const creating = ref(false)
const form = ref({
  name: '',
  requiredPoints: 1,
  totalStock: 1
})

async function loadPrizes() {
  const res = await getManagerPrizes()
  prizes.value = res.data || []
}

async function handleCreate() {
  if (!form.value.name?.trim()) return
  creating.value = true
  try {
    await createPrize({
      name: form.value.name.trim(),
      requiredPoints: Number(form.value.requiredPoints),
      totalStock: Number(form.value.totalStock)
    })
    showSuccessToast('创建成功')
    showCreate.value = false
    form.value = { name: '', requiredPoints: 1, totalStock: 1 }
    await loadPrizes()
  } finally {
    creating.value = false
  }
}

async function handleArchive(id) {
  try {
    await showConfirmDialog({
      title: '确认下架',
      message: '下架后打卡者将不可见该奖品'
    })
    await archivePrize(id)
    showSuccessToast('已下架')
    await loadPrizes()
  } catch {
    // 用户取消确认弹窗时不处理
  }
}

onMounted(loadPrizes)
</script>

<style scoped>
.content { padding: var(--spacing-md); padding-bottom: 80px; }
.fab { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); }
.create-form {
  padding: var(--spacing-md);
}
.create-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}
</style>
