<template>
  <div class="gantt-tree">
    <header>
      <slot name="header"></slot>
    </header>
    <div ref="treeContainer" class="tree-container" @scroll="onScroll">
      <!-- TODO: draggable -->
      <el-tree
        ref="tree"
        v-loading="dragging"
        :data="treeData"
        :expand-on-click-node="false"
        :draggable="false"
        node-key="id"
        @node-expand="onNodeExpand"
        @node-collapse="onNodeCollapse"
        @node-drop="onDrop"
        @node-click="onNodeClick"
      >
        <template v-slot="{ data: d }">
          <div class="tree-node el-tree-node__label">
            <div
              v-if="isMilestone(d)"
              :class="['milestone-mark', { done: d.done }]"
            ></div>
            <span class="name ellipsis" :title="d.name">{{ d.name }}</span>
            <!-- FIXME: 暂时隐藏进度和操作 -->
            <!-- <span class="progress">{{ d.progress.toFixed(0) }}%</span>
            <el-link
              class="delete"
              type="danger"
              :underline="false"
              @click="onDelete(d)"
              >删除</el-link
            > -->
          </div>
        </template>
      </el-tree>
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  BaseItem,
  GanttData,
  GanttNode,
  GanttItem,
  Bus,
  BaseMilestone,
} from '@/utils/types'
import { isGroup, search, isMilestone } from '@/utils'

// REVIEW: 可能要抽离 Milestone 节点类型，才好进一步拓展功能
interface TreeNode extends BaseItem {
  progress?: GanttItem['progress']
  done?: BaseMilestone['done']
  children?: TreeNode[]
}

interface ElTreeNode {
  data: TreeNode
}

function transform(item: GanttNode): TreeNode {
  const base = {
    id: item.id,
    name: item.name,
  }
  if (isGroup(item)) {
    return {
      ...base,
      progress: item.progress,
      children: item.children.map(transform),
    }
  } else if (isMilestone(item)) {
    return {
      ...base,
      done: item.done,
    }
  } else {
    return {
      ...base,
      progress: item.progress,
    }
  }
}

export default Vue.extend({
  name: 'GanttTree',
  props: {
    bus: {
      type: Object as PropType<Bus>,
      required: true,
    },
    data: {
      type: Array as PropType<GanttData>,
      required: true,
    },
    scrollTop: {
      type: Number,
      required: true,
    },
  },
  data: () => ({
    dragging: false,
  }),
  computed: {
    treeData(): TreeNode[] {
      return this.data.map(transform)
    },
  },
  watch: {
    scrollTop(v) {
      ;(this.$refs.treeContainer as HTMLElement).scrollTo(0, v)
    },
    treeData: {
      handler() {
        /**
         * 手动控制内部节点的展开状态；default-expanded-keys 很难用
         * @see https://blog.csdn.net/gaojie_csdn/article/details/80738488
         */
        this.$nextTick(() => {
          const { nodesMap } = (this.$refs.tree as any).store
          for (const k in nodesMap) {
            nodesMap[k].expanded = !this.bus.collapsedMap[k]
          }
        })
      },
      immediate: true,
    },
  },
  methods: {
    isMilestone,
    onNodeExpand(node: TreeNode) {
      this.expandData(node)
    },
    onNodeCollapse(node: TreeNode) {
      this.expandData(node, false)
    },
    expandData(node: TreeNode, expand = true) {
      this.bus.collapsedMap[node.id] = !expand
    },
    onDelete(node: TreeNode) {
      // @ts-ignore
      this.$confirm(`确定删除“${node.name}”？`, '提示', {
        type: 'warning',
        beforeClose: (action: string, instance: any, done: Function) => {
          if (action !== 'confirm') return done()
          instance.confirmButtonLoading = true
          const callback = () => {
            instance.confirmButtonLoading = false
            done()
          }
          this.$emit('delete', {
            id: node.id,
            done: callback,
          })
        },
      }).catch(() => {})
    },
    /**
     * 调用时，treeData 已经变更了
     */
    onDrop(
      draggingNode: ElTreeNode,
      _dropNode: ElTreeNode,
      dropType: 'inner' | 'after' | 'before',
    ) {
      this.dragging = true
      const done = () => (this.dragging = false)
      // REVIEW: 其实处理方式是一样的，先观望一下再移除 switch 代码
      switch (dropType) {
        case 'inner':
        case 'before':
        case 'after':
          this.notifyMovement(draggingNode.data.id, done)
          break
      }
    },
    notifyMovement(id: GanttNode['id'], done: Function) {
      const [node, parent] = search(id, this.treeData) as [TreeNode, TreeNode?]
      const index = (parent ? parent.children! : this.treeData).indexOf(node)
      // console.log(node, oldParent, parent)
      this.$emit('move', {
        id: node.id,
        pid: parent ? parent.id : undefined,
        index,
        done,
      })
    },
    onScroll(e: { target: HTMLElement }) {
      this.$emit('update:scrollTop', e.target.scrollTop)
    },
    onNodeClick(node: TreeNode) {
      const { ee } = this.bus
      ee.emit(ee.Event.ScrollToNode, node.id)
    },
  },
})
</script>
<style lang="less" scoped>
@import '../assets/vars';

.gantt-tree {
  display: flex;
  flex-direction: column;

  header {
    height: @header-height;
    display: flex;
    padding: 0 5px;
  }

  .tree-container {
    flex: 1 0 0;
    overflow-x: scroll; // 与 chart 下边对齐
    overflow-y: auto;
    padding: 0 2px 20px 0;

    .tree-node {
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      min-width: 0; // make ellipsis work in grid item
      padding-right: 5px;

      .milestone-mark {
        margin-right: 4px;
        width: 8px;
        height: 8px;
        transform: rotate(45deg);
        border: 1.5px solid @progress-content;
        border-radius: 2px;

        &.done {
          border-color: @done;
        }
      }

      .name {
        margin-right: 5px;
      }

      .progress {
        margin-left: auto;
      }

      .delete {
        margin-left: 5px;
      }
    }
  }

  /deep/ .el-tree-node__content {
    height: 30px; // FIXME: 使用 rowH
  }
}
</style>
