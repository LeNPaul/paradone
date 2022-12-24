<template>
    <!-- Button trigger modal -->
    <button type="button" class="btn btn-outline mb-3" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
        <i class="fas fa-plus"></i>
    </button>
    <!-- Modal -->
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content border-0">
                <div class="modal-body p-0">
                    <form @submit="onSubmit" class="form-control add-form p-3 border-0">
                        <div class="mb-3">
                        <input type="text" v-model="title" name="title" placeholder="Title" class="form-control border-0 shadow-none">
                        <textarea type="text" v-model="content" name="content" placeholder="Content" class="form-control border-0 shadow-none" rows="3"></textarea>
                        </div>
                        <button type="submit" class="btn btn-dark">Save</button>
                        <button :key='task.title' v-for="task in parentTasks" type="button" class="btn btn-outline-dark p-1 ms-2 px-2" @click="this.parentTasks=this.parentTasks.filter(parentTask=>parentTask._id!=task._id)">{{ task.title }}</button>
                        <button class="btn btn-outline-dark btn-sm float-end" type="button" data-bs-toggle="dropdown"><i class="fas fa-list"></i></button>
                        <ul class="dropdown-menu">
                            <li :key='task.title' v-for="task in tasks" v-show="!this.parentTasks.some(parentTask=>parentTask._id==task._id) && !task.completed" @click="this.parentTasks.push({_id: task._id, title: task.title})"><a class="dropdown-item">{{ task.title }}</a></li>
                        </ul>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>