// const asyncHandler = () => {}

// const asyncHandler = (fn) => async(req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         next(error);
//         res.status(500).json({ 
//             success: false,
//             message: error.message });
//     }
// }

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        console.error("Error in asyncHandler:", error);
        next(error);
    });
}

export default asyncHandler