const Loader = () => {
  return (
    <div className="flex items-center justify-center h-full w-full min-h-[500px]">
      <div className="w-10 h-10 border-4 border-t-primary border-gray-200 rounded-full animate-spin" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default Loader
