import { LightningElement,track,api } from 'lwc';
import getTaskPriority from "@salesforce/apex/RowActionsHandler.getTaskPriority";
import getTaskStatus from "@salesforce/apex/RowActionsHandler.getTaskStatus";
import okTask from "@salesforce/apex/RowActionsHandler.okTask";
import getActiveUser from "@salesforce/apex/RowActionsHandler.getActiveUser";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class ModalPopupLWC extends LightningElement {
    @api isModalOpen = false;

    @track taskPriority
    @track taskStatus
    @track selectedTaskPriority
    @track selectedTaskStatus
    @track ActivityDate
    @track Subject
    @track activeUsers
    @track selectedActiveUsers

    connectedCallback() {
        getTaskPriority().then(res => {
            this.taskPriority = []
            res.forEach(el => {
                this.taskPriority.push({
                    label: el,
                    value: el
                })
            })
        })
        getTaskStatus().then(res => {
            this.taskStatus = []
            res.forEach(el => {
                this.taskStatus.push({
                    label: el,
                    value: el
                })
            })
        })
        getActiveUser().then(res => {
            this.activeUsers = []
            res.forEach(el => {
                this.activeUsers.push({
                    label: el.Name,
                    value: el.Id
                })
            })
        })
    }
    handlerDate(e) {
        this.ActivityDate = e.target.value
    }
    handlerSubject(e) {
        this.Subject = e.target.value
    }
    handlerselectedTaskStatus(e) {
        this.selectedTaskStatus = e.target.value
    }
    handlerselectedTaskPriority(e) {
        this.selectedTaskPriority = e.target.value
    }
    handlerselectedActiveUsers(e) {
        this.selectedActiveUsers = e.target.value
        console.log(e.target.value)
    }

    saveTask() {
        console.log(this.selectedTaskStatus)
        console.log(this.selectedTaskPriority)
        console.log(this.ActivityDate)
        console.log(this.Subject)
        if (!this.Subject , !this.selectedTaskStatus , !this.selectedTaskPriority) {
            const event = new ShowToastEvent({
                title: 'Error',
                variant: "error",
                message: 'Not all required fields were filled',
            });
            this.dispatchEvent(event);
        } else {
            okTask({
                Subject: this.Subject,
                ActivityDate: this.ActivityDate,
                Status: this.selectedTaskStatus,
                Priority: this.selectedTaskPriority,
                OwnerId: this.selectedActiveUsers
            }).then(res => {
                const event = new ShowToastEvent({
                    title: 'Success',
                    variant: "success",
                    message: 'Task has been created successfully',
                });
                this.dispatchEvent(event);
                this.closeModal();
            }).catch(err => console.error(err))
        }
    }
    openModal() {
        // to open modal set isModalOpen tarck value as true
        this.isModalOpen = true;
    }
    closeModal() {
        // to close modal set isModalOpen tarck value as false
        this.isModalOpen = false;
        const selectEvent = new CustomEvent('modalclose', {});
        this.dispatchEvent(selectEvent);
    }
    submitDetails() {
        // to close modal set isModalOpen tarck value as false
        //Add your code to call apex method or do some processing
        this.isModalOpen = false;
    }
}