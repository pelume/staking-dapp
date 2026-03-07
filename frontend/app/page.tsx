"use client"

import { useState } from "react"
import { ethers } from "ethers"
import StakerABI from "../abi/Staker.json"

const contractAddress = "0xDFC9DdAcB05a4a44E9Cf890C06E65d3dE78f9BC0"

export default function Home() {
  const [account, setAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [balance, setBalance] = useState("0")
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState("")
  const [error, setError] = useState("")
  const [action, setAction] = useState("") // "staking" | "unstaking"

  async function connectWallet() {
    if (!window.ethereum) {
      setError("MetaMask not found. Please install it.")
      return
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await provider.send("eth_requestAccounts", [])

    setAccount(accounts[0])
    setTxHash("")
    setError("")

    await getBalance(accounts[0])
  }

  function disconnectWallet() {
    setAccount("")
    setBalance("0")
    setAmount("")
    setTxHash("")
    setError("")
  }

  async function getBalance(userAddress: string) {
    if (!window.ethereum) return

    const provider = new ethers.BrowserProvider(window.ethereum)

    const contract = new ethers.Contract(
      contractAddress,
      StakerABI,
      provider
    )

    const bal = await contract.balances(userAddress)
    const formatted = ethers.formatEther(bal)
    setBalance(formatted)
  }

  async function stake() {
    setError("")
    setTxHash("")

    if (!window.ethereum) return setError("MetaMask not found.")
    if (!amount || isNaN(Number(amount))) return setError("Please enter a valid amount.")
    if (Number(amount) <= 0) return setError("Amount must be greater than 0.")

    try {
      setIsLoading(true)
      setAction("staking")

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const contract = new ethers.Contract(contractAddress, StakerABI, signer)

      const tx = await contract.stake({
        value: ethers.parseEther(amount),
      })

      setTxHash(tx.hash)

      await tx.wait()

      await getBalance(account)
      setAmount("")

    } catch (err: unknown) {
      let errorMessage = "Transaction failed."
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'object' && err !== null) {
        const e = err as Record<string, unknown>
        if (typeof e.reason === 'string') {
          errorMessage = e.reason
        } else if (typeof e.message === 'string') {
          errorMessage = e.message
        }
      }
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      setAction("")
    }
  }

  async function unstake() {
    setError("")
    setTxHash("")

    if (!window.ethereum) return setError("MetaMask not found.")
    if (!amount || isNaN(Number(amount))) return setError("Please enter a valid amount.")
    if (Number(amount) <= 0) return setError("Amount must be greater than 0.")
    if (Number(amount) > Number(balance)) return setError("You cannot unstake more than your staked balance.")

    try {
      setIsLoading(true)
      setAction("unstaking")

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const contract = new ethers.Contract(contractAddress, StakerABI, signer)

      const tx = await contract.unstake(ethers.parseEther(amount))

      setTxHash(tx.hash)

      await tx.wait()

      await getBalance(account)
      setAmount("")

    } catch (err: unknown) {
      let errorMessage = "Transaction failed."
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'object' && err !== null) {
        const e = err as Record<string, unknown>
        if (typeof e.reason === 'string') {
          errorMessage = e.reason
        } else if (typeof e.message === 'string') {
          errorMessage = e.message
        }
      }
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      setAction("")
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>⚡ Staking App</h1>

        {/* Wallet Section */}
        {!account ? (
          <button style={styles.connectBtn} onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <div style={styles.walletBox}>
            <p style={styles.accountText}>
              🟢 {account.slice(0, 6)}...{account.slice(-4)}
            </p>
            <button style={styles.disconnectBtn} onClick={disconnectWallet}>
              Disconnect
            </button>
          </div>
        )}

        {/* Balance */}
        {account && (
          <div style={styles.balanceBox}>
            <p style={styles.balanceLabel}>Your Staked Balance</p>
            <p style={styles.balanceValue}>{balance} ETH</p>
          </div>
        )}

        {/* Input */}
        {account && (
          <>
            <input
              type="number"
              placeholder="Enter amount in ETH"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setError("")
              }}
              style={styles.input}
              disabled={isLoading}
            />

            <div style={styles.btnRow}>
              <button
                onClick={stake}
                disabled={isLoading}
                style={{ ...styles.stakeBtn, opacity: isLoading ? 0.6 : 1 }}
              >
                {isLoading && action === "staking" ? "⏳ Staking..." : "Stake"}
              </button>

              <button
                onClick={unstake}
                disabled={isLoading}
                style={{ ...styles.unstakeBtn, opacity: isLoading ? 0.6 : 1 }}
              >
                {isLoading && action === "unstaking" ? "⏳ Unstaking..." : "Unstake"}
              </button>
            </div>
          </>
        )}

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        {/* TX Hash Link */}
        {txHash && (
          <div style={styles.txBox}>
            {isLoading ? "⏳ Transaction pending..." : "✅ Transaction confirmed!"}
            <br />
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.txLink}
            >
              View on Sepolia Etherscan ↗
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f0f0f",
    fontFamily: "sans-serif",
  },
  card: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #2e2e2e",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
    color: "#fff",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "24px",
    textAlign: "center",
  },
  connectBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "600",
  },
  walletBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    borderRadius: "8px",
    padding: "10px 14px",
    marginBottom: "16px",
  },
  accountText: {
    margin: 0,
    fontSize: "14px",
    color: "#a3e635",
  },
  disconnectBtn: {
    backgroundColor: "transparent",
    border: "1px solid #ef4444",
    color: "#ef4444",
    borderRadius: "6px",
    padding: "4px 10px",
    cursor: "pointer",
    fontSize: "13px",
  },
  balanceBox: {
    textAlign: "center",
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "#111",
    borderRadius: "10px",
    border: "1px solid #2e2e2e",
  },
  balanceLabel: {
    margin: "0 0 4px",
    fontSize: "13px",
    color: "#888",
  },
  balanceValue: {
    margin: 0,
    fontSize: "26px",
    fontWeight: "700",
    color: "#facc15",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #333",
    backgroundColor: "#111",
    color: "#fff",
    fontSize: "15px",
    marginBottom: "14px",
    boxSizing: "border-box",
  },
  btnRow: {
    display: "flex",
    gap: "10px",
  },
  stakeBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  unstakeBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#f97316",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  errorBox: {
    marginTop: "14px",
    padding: "10px 14px",
    backgroundColor: "#2a1010",
    border: "1px solid #ef4444",
    borderRadius: "8px",
    color: "#ef4444",
    fontSize: "13px",
  },
  txBox: {
    marginTop: "14px",
    padding: "10px 14px",
    backgroundColor: "#0f2a1a",
    border: "1px solid #22c55e",
    borderRadius: "8px",
    color: "#86efac",
    fontSize: "13px",
    lineHeight: "1.6",
  },
  txLink: {
    color: "#4ade80",
    textDecoration: "underline",
  },
}