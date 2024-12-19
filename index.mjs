import dgram from 'node:dgram';
import dnsPacket from 'dns-packet';

const server = dgram.createSocket('udp4');

const db = {
  'google.com': {
    type: 'A',
    data: '1.2.3.4'
  },
  'blog.google.com': {
    type: 'CNAME',
    data: 'hashnode.network'
  },
}

server.on('message', (msg, rinfo) => {
  const incomingReq = dnsPacket.decode(msg);
  const ipFromDb = db[incomingReq.questions[0].name]

  const ans = dnsPacket.encode({
    type: 'response',
    id: incomingReq.id,
    flags: dnsPacket.AUTHORITATIVE_ANSWER,
    questions: incomingReq.questions,
    answers: [{
      type: ipFromDb.type,
      class: 'IN',
      name: incomingReq.questions[0].name,
      data: ipFromDb.data
    }]
  })

  server.send(ans, rinfo.port, rinfo.address)
  console.log({
    questions: incomingReq.questions,
    rinfo
  });
});

server.bind(53, () => console.log('DNS server is running on port 53'));
