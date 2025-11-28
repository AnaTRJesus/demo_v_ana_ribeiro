async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with account:", deployer.address);

  const Factory = await ethers.getContractFactory("CertificateRegistry");
  const contract = await Factory.deploy();

  // Ethers v6 → aguardar deploy assim:
  await contract.waitForDeployment();

  console.log("Contract deployed at:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
