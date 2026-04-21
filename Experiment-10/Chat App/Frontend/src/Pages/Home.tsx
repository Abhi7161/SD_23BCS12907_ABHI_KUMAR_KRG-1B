import LeftSideBar from "../Components/leftSideBar";
import Center from "../Components/Center";
function Home() {
  return (
    <div>
      <div className="flex h-screen">
        <LeftSideBar />
        <Center />
      </div>
    </div>
  );
}

export default Home;
