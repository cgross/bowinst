module.exports = {
    extensions: [
        {
            id:'bowinst.css',
            options: {
                file: '<%= index %>'
            }
        },
        {
            id:'bowinst.js',
            options: {
                file: '<%= index %>'
            }
        },
        {
            id:'bowinst.angular',
            options: {
                file: '<%= appjs %>'
            }
        }
    ]
};