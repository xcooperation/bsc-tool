
import Message from "./Message"

export default function Logger({ messages, LoggerDiv }) {
  return (
    <div style={{ overflowY: "scroll", maxHeight: "80vh" }} ref={LoggerDiv}>
      {
        <>
          <ol>{messages && messages.map((msg, index) => <Message key={index} message={msg} />)}</ol>
          <div className="text-center">
            <div
              className="spinner-border"
              role="status"
              style={{ width: "3rem", height: "3rem" }}
            ></div>
          </div>
        </>
      }
    </div>
  )
}
