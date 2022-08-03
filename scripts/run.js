const hre = require("hardhat");

const main = async () => {
  const rsvpContractFactory = await hre.ethers.getContractFactory("git");
  const rsvpContract = await rsvpContractFactory.deploy();
  await rsvpContract.deployed();
  console.log("Contract Deployed TO :", rsvpContract.address);

  const [deployer, address1, address2] = await hre.ethers.getSigners();

  let deposit = hre.ethers.utils.parseEther("1");
  let maxCapacity = 3;
  let timestamp = 1718926200;
  let eventCID = "bafybeibhwfzx6oo5rymsxmkdxpmkfwyvbjrrwcl7cekmbzlupmp5ypkyfi";

  let txn = await rsvpContract.createNewEvent(
    timestamp,
    deposit,
    maxCapacity,
    eventCID
  );

  let wait = await txn.wait();
  console.log("New Event Created :", wait.events[0].event, wait.events[0].args);

  let eventID = wait.events[0].args[0];
  console.log("EVENT ID:", eventID);

  txn = await rsvpContract.createNewRsvp(eventID, { value: deposit });
  wait = await txn.wait();
  console.log("New RSVP:", wait.events[0].event, wait.events[0].args);

  txn = await rsvpContract
    .connect(address1)
    .createNewRsvp(eventID, { value: deposit });

  wait = await txn.wait();
  console.log("New RSVP:", wait.events[0].event, wait.events[0].args);

  txn = await rsvpContract
    .connect(address2)
    .createNewRsvp(eventID, { value: deposit });
  wait = await txn.wait();
  console.log("New RSVP:", wait.events[0].event, wait.events[0].args);

  txn = await rsvpContract.confirmAllAttendees(eventID);
  wait = await txn.wait();
  wait.events.forEach((event) => {
    console.log("Confirmed:", event.args.attendeeAddress);
  });

  await hre.network.provider.send("evm_increaseTime", [15778800000000]);

  txn = await rsvpContract.withdrawUnclaimedDeposits(eventID);
  wait = await txn.wait();
  console.log("Withdrawn:", wait.events[0].event, wait.events[0].args);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
