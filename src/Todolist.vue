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
                        placeholder="Enter todo..."
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
            <flex-table
                :columns="columns"
                :data="lists"
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
import relativeTime from 'dayjs/plugin/relativeTime'
import {
    localSave,
    localRead
} from './util'

dayjs.extend(relativeTime)

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
                        const { status, finishDate } = params.row
                        const color = status ? 'success' : 'default'
                        const text = status ? `已完成 ${finishDate}` : '待完成'
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
            const { startDate } = this.lists[index]
            this.lists[index].status = 1
            this.lists[index].finishDate = dayjs(startDate).fromNow()
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
