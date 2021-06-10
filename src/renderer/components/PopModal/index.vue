<template>
    <div class="popover">

    </div>
</template>

<script>
import "./Popover.scss";

export default {
    name: "PopModal",
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
