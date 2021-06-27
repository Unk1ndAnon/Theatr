<template>
    <div class="popover">

    </div>
</template>

<script>
import "./Modal.scss";

export default {
    name: "DetailModal",
    props: {
        initiator: { required: true, },
    },
    computed: {},
    methods: {},
    data() {
        return {
            videoplayer: null,
        }
    },
    created() {

    },
    mounted() {

    },
    beforeUnmount() {
        // TODO destroy all child instances
    }
}
</script>
