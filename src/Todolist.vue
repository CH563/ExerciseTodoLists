<template>
    <div>
        <div class="add">
            <Form
                :model="form"
                ref="form"
                :rules="rule"
                @submit.native.prevent
            >
                <FormItem prop="todo">
                    <Input
                        v-model.trim="form.todo"
                        placeholder="添加todo任务..."
                        style="width: 420px"
                        :maxlength="50"
                        size="large"
                        @on-enter="add"
                    />
                    <div class="font-num">{{form.todo.length}}/50</div>
                    <Button
                        type="primary"
                        size="large"
                        :disabled="!form.todo.length"
                        @click="add"
                    >添加Todo</Button>
                </FormItem>
            </Form>
        </div>
        <div class="content">
            <div class="tool">
                <Input
                    v-model.trim="search"
                    placeholder="输入关键字搜索"
                    style="width: 240px; margin-right: 15px"
                />
                <Select
                    v-model="status"
                    style="width:120px"
                >
                <Option :value="-1">全部</Option>
                <Option :value="0">待完成</Option>
                <Option :value="1">已完成</Option>
            </Select>
            </div>
            <flex-table
                :columns="columns"
                :data="filterList"
            >
                <template slot-scope="{row, index}" slot="operation">
                    <Button
                        icon="md-checkbox-outline"
                        @click="finish(index)"
                        size="small"
                        style="margin-right: 10px"
                        v-show="!row.status"
                    >完成</Button>
                    <Button
                        icon="md-trash"
                        type="error"
                        @click="deleteItem(row, index)"
                        size="small"
                    >删除</Button>
                </template>
            </flex-table>
        </div>
    </div>
</template>
<script>
import dayjs from 'dayjs'
import {
    localSave,
    localRead
} from './util'

const TODO_LIST_DATA = 'todoListData'

export default {
    data () {
        const validateTodo = (rule, value, callback) => {
            if (this.lists.some(item => item.title === value && item.status === 0)) {
                callback(new Error('已存在未完成todo，请完成后再添加'))
            } else {
                callback()
            }
        }
        return {
            search: '',
            status: -1,
            form: {
                todo: ''
            },
            rule: {
                todo: [
                    { validator: validateTodo }
                ]
            },
            columns: [
                {
                    title: 'Todo',
                    key: 'title',
                    render: (h, params) => {
                        const { title, status } = params.row
                        const tag = status ? 'del' : 'strong'
                        return h(tag, title)
                    }
                },
                {
                    title: '状态',
                    key: 'status',
                    width: 150,
                    render: (h, params) => {
                        const { status } = params.row
                        const color = status ? 'success' : 'default'
                        const text = status ? `已完成` : '待完成'
                        return h('Tag', {
                            props: {
                                color
                            }
                        }, text)
                    }
                },
                {
                    title: '添加时间',
                    key: 'startDate',
                    width: 240
                },
                {
                    title: '操作',
                    key: 'operation',
                    width: 240,
                    type: 'slot'
                }
            ],
            lists: []
        }
    },
    watch: {
        lists (value) {
            localSave(TODO_LIST_DATA, JSON.stringify(value))
        }
    },
    computed: {
        filterList () {
            return this.lists.filter(item => {
                const searchVal = this.search.toLowerCase()
                const titleVal = item.title.toLowerCase()
                const isStatus = this.status > -1 ? (item.status === this.status) : true
                return titleVal.indexOf(searchVal) > -1 && isStatus
            })
        }
    },
    methods: {
        getData () {
            const data = localRead(TODO_LIST_DATA)
            if (data) {
                this.lists = JSON.parse(data)
            }
        },
        add () {
            if (!this.form.todo) return
            this.$refs.form.validate(valid => {
                if (valid) {
                    this.lists.push({
                        title: this.form.todo,
                        status: 0,
                        startDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                        finishDate: ''
                    })
                    this.$Message.success('添加成功')
                    this.form.todo = ''
                }
            })
        },
        finish (index) {
            this.lists[index].status = 1
            this.lists[index].finishDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
            localSave(TODO_LIST_DATA, JSON.stringify(this.lists))
        },
        deleteItem (row, index) {
            this.$Modal.confirm({
                title: '删除',
                content: `您确定要删除 ${row.title} 吗？`,
                onOk: () => {
                    this.lists.splice(index, 1)
                }
            })
        }
    },
    mounted () {
        this.getData()
    }
}
</script>
<style>
.add{
    padding: 20px;
    text-align: center;
    margin-bottom: 15px;
    background: #fff;
    box-shadow: 0 5px 5px rgba(0, 0, 0, .05);
}
.font-num{
    display: inline-block;
    vertical-align: middle;
    margin: 0 5px;
    color: #999;
}
.tool{
    padding-bottom: 15px;
}
.content{
    padding: 15px 50px;
}
.content del{
    color: #999;
}
.ivu-form-item-content{
    display: inline-block;
}
</style>
