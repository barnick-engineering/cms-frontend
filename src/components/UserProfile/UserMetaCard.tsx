export default function UserMetaCard() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            {/* <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img src="/images/user/owner.jpg" alt="user" />
            </div> */}
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left"></h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <div className="hidden h-10 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                  {currentUser.designation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
