<template>
    <button
        class="btn btn_secondary"
        @click="$emit('click', $event)"
    >
        <slot></slot>
    </button>
</template>

<script>
    // emit click($event)
    export default {
        name : "VButton",
    };
</script>